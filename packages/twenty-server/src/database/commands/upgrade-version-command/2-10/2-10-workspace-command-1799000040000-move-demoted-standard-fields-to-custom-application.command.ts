import { Command } from 'nest-commander';

import { InjectRepository } from '@nestjs/typeorm';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { getMetadataSerializedRelationNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-serialized-relation-names.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DEMOTED_STANDARD_FIELDS: {
  universalIdentifier: string;
  label: string;
}[] = [
  {
    universalIdentifier: '20202020-602a-495c-9776-f5d5b11d227b',
    label: 'Company.annualRecurringRevenue',
  },
  {
    universalIdentifier: '20202020-8965-464a-8a75-74bafc152a0b',
    label: 'Company.employees',
  },
  {
    universalIdentifier: '20202020-ba6b-438a-8213-2c5ba28d76a2',
    label: 'Company.idealCustomerProfile',
  },
  {
    universalIdentifier: '20202020-6f64-4fd9-9580-9c1991c7d8c3',
    label: 'Company.xLink',
  },
  {
    universalIdentifier: '20202020-8fc2-487c-b84a-55a99b145cfd',
    label: 'Person.xLink',
  },
  {
    universalIdentifier: '20202020-5243-4ffb-afc5-2c675da41346',
    label: 'Person.city',
  },
];

@RegisteredWorkspaceCommand('2.10.0', 1799000040000)
@Command({
  name: 'upgrade:2-10:move-demoted-standard-fields-to-custom-application',
  description:
    'Re-own the demoted Company ARR / ICP / Employees, Company/Person X (Twitter) and Person City standard fields to the workspace custom application, preserving their data and keeping them active',
})
export class MoveDemotedStandardFieldsToCustomApplicationCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
    @InjectRepository(FieldMetadataEntity)
    private readonly fieldMetadataRepository: Repository<FieldMetadataEntity>,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { twentyStandardFlatApplication, workspaceCustomFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
      ]);

    const fieldsToReown: { id: string; label: string }[] = [];

    for (const {
      universalIdentifier,
      label,
    } of DEMOTED_STANDARD_FIELDS) {
      const flatFieldMetadata =
        findFlatEntityByUniversalIdentifier<FlatFieldMetadata>({
          flatEntityMaps: flatFieldMetadataMaps,
          universalIdentifier,
        });

      if (!isDefined(flatFieldMetadata)) {
        continue;
      }

      const isStillOwnedByStandardApplication =
        flatFieldMetadata.applicationId === twentyStandardFlatApplication.id &&
        !flatFieldMetadata.isCustom;

      if (!isStillOwnedByStandardApplication) {
        continue;
      }

      fieldsToReown.push({ id: flatFieldMetadata.id, label });
    }

    if (fieldsToReown.length === 0) {
      this.logger.log(
        `No standard fields to move to the custom application for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Moving ${fieldsToReown.length} field(s) to the custom application for workspace ${workspaceId}: ${fieldsToReown.map(({ label }) => label).join(', ')}`,
    );

    if (isDryRun) {
      return;
    }

    for (const { id } of fieldsToReown) {
      await this.fieldMetadataRepository.update(
        { id },
        {
          applicationId: workspaceCustomFlatApplication.id,
          isCustom: true,
          universalIdentifier: uuidv4(),
        },
      );
    }

    const fieldMetadataRelatedNames = [
      'fieldMetadata',
      ...getMetadataRelatedMetadataNames('fieldMetadata'),
      ...getMetadataSerializedRelationNames('fieldMetadata'),
    ] as const;
    const cacheKeysToFlush = [
      ...new Set(fieldMetadataRelatedNames.map(getMetadataFlatEntityMapsKey)),
    ];

    await this.workspaceCacheService.flush(workspaceId, cacheKeysToFlush);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Moved ${fieldsToReown.length} field(s) to the custom application for workspace ${workspaceId}`,
    );
  }
}
