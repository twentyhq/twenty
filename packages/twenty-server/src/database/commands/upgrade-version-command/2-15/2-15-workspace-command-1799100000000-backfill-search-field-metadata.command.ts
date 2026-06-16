import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { isFlatFieldMetadataOfType } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-flat-field-metadata-of-type.util';
import { type UniversalFlatSearchFieldMetadata } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-search-field-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Matches PostgreSQL quoted column identifiers in the searchVector asExpression.
// Constrained to identifier characters so it re-syncs correctly across the embedded
// double-quotes that EMAILS/PHONES expressions place inside SQL string literals
// (e.g. '[]","' or '"(number|countryCode|callingCode)"').
const QUOTED_COLUMN_NAME_REGEX = /"([A-Za-z0-9_]+)"/g;

@RegisteredWorkspaceCommand('2.15.0', 1799100000000)
@Command({
  name: 'upgrade:2-15:backfill-search-field-metadata',
  description:
    'Backfill searchFieldMetadata rows mirroring each searchable object searchVector field set. Idempotent: existing rows are skipped.',
})
export class BackfillSearchFieldMetadataCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const {
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
      flatSearchFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
      'flatSearchFieldMetadataMaps',
    ]);

    const existingSearchFieldMetadataKeys = new Set(
      Object.values(flatSearchFieldMetadataMaps.byUniversalIdentifier)
        .filter(isDefined)
        .map(
          (searchFieldMetadata) =>
            `${searchFieldMetadata.objectMetadataId}:${searchFieldMetadata.fieldMetadataId}`,
        ),
    );

    const allFlatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const flatFieldMetadatasByObjectMetadataId = new Map<
      string,
      FlatFieldMetadata[]
    >();

    for (const flatFieldMetadata of allFlatFieldMetadatas) {
      const objectFlatFieldMetadatas =
        flatFieldMetadatasByObjectMetadataId.get(
          flatFieldMetadata.objectMetadataId,
        ) ?? [];

      objectFlatFieldMetadatas.push(flatFieldMetadata);
      flatFieldMetadatasByObjectMetadataId.set(
        flatFieldMetadata.objectMetadataId,
        objectFlatFieldMetadatas,
      );
    }

    const now = new Date().toISOString();
    const flatSearchFieldMetadataToCreate: UniversalFlatSearchFieldMetadata[] =
      [];

    for (const flatObjectMetadata of Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined)) {
      if (!flatObjectMetadata.isSearchable) {
        continue;
      }

      const objectFlatFieldMetadatas =
        flatFieldMetadatasByObjectMetadataId.get(flatObjectMetadata.id) ?? [];

      const searchVectorFlatFieldMetadata = objectFlatFieldMetadatas.find(
        (flatFieldMetadata) =>
          isFlatFieldMetadataOfType(
            flatFieldMetadata,
            FieldMetadataType.TS_VECTOR,
          ),
      );

      if (
        !isDefined(searchVectorFlatFieldMetadata) ||
        !isFlatFieldMetadataOfType(
          searchVectorFlatFieldMetadata,
          FieldMetadataType.TS_VECTOR,
        )
      ) {
        continue;
      }

      const asExpression = searchVectorFlatFieldMetadata.settings?.asExpression;

      if (!isDefined(asExpression)) {
        continue;
      }

      const quotedColumnNames = Array.from(
        asExpression.matchAll(QUOTED_COLUMN_NAME_REGEX),
        (match: RegExpMatchArray) => match[1],
      );

      const matchedFieldMetadataById = new Map<string, FlatFieldMetadata>();

      for (const columnName of quotedColumnNames) {
        const matchedFlatFieldMetadata = objectFlatFieldMetadatas.find(
          (flatFieldMetadata) =>
            flatFieldMetadata.id !== searchVectorFlatFieldMetadata.id &&
            (flatFieldMetadata.name === columnName ||
              columnName.startsWith(flatFieldMetadata.name)),
        );

        if (isDefined(matchedFlatFieldMetadata)) {
          matchedFieldMetadataById.set(
            matchedFlatFieldMetadata.id,
            matchedFlatFieldMetadata,
          );
        }
      }

      for (const matchedFlatFieldMetadata of matchedFieldMetadataById.values()) {
        const searchFieldMetadataKey = `${flatObjectMetadata.id}:${matchedFlatFieldMetadata.id}`;

        if (existingSearchFieldMetadataKeys.has(searchFieldMetadataKey)) {
          continue;
        }

        flatSearchFieldMetadataToCreate.push({
          universalIdentifier: v4(),
          createdAt: now,
          updatedAt: now,
          applicationUniversalIdentifier:
            flatObjectMetadata.applicationUniversalIdentifier,
          objectMetadataUniversalIdentifier:
            flatObjectMetadata.universalIdentifier,
          fieldMetadataUniversalIdentifier:
            matchedFlatFieldMetadata.universalIdentifier,
        });
      }
    }

    if (flatSearchFieldMetadataToCreate.length === 0) {
      this.logger.log(
        `No missing searchFieldMetadata rows for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Found ${flatSearchFieldMetadataToCreate.length} missing searchFieldMetadata row(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          allFlatEntityOperationByMetadataName: {
            searchFieldMetadata: {
              flatEntityToCreate: flatSearchFieldMetadataToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to persist searchFieldMetadata rows:\n${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );

      throw new Error(
        `Failed to persist searchFieldMetadata rows for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ${flatSearchFieldMetadataToCreate.length} searchFieldMetadata row(s) for workspace ${workspaceId}`,
    );
  }
}
