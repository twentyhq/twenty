import { InjectRepository } from '@nestjs/typeorm';

import { Command, Option } from 'nest-commander';
import {
  ALL_METADATA_NAME,
  type AllMetadataName,
} from 'twenty-shared/metadata';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type ActiveOrSuspendedWorkspacesMigrationCommandOptions,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceMigrationRunnerService } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/services/workspace-migration-runner.service';

type FlatCacheFlushCommandOptions =
  ActiveOrSuspendedWorkspacesMigrationCommandOptions & {
    allMetadata?: boolean;
  };

@Command({
  name: 'cache:flat-cache-invalidate',
  description:
    'Flush flat entity cache for specific metadata names and workspaces',
})
export class FlatCacheInvalidateCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner<FlatCacheFlushCommandOptions> {
  private metadataNames: string[] = [];
  private flatMapsKeysToFlush: (keyof AllFlatEntityMaps)[] = [];

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceMigrationRunnerService: WorkspaceMigrationRunnerService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  @Option({
    flags: '--metadataName <metadataName>',
    description:
      'Metadata name(s) to flush cache for. Can be specified multiple times.',
    required: false,
  })
  parseMetadataName(val: string): string[] {
    this.metadataNames.push(val);

    return this.metadataNames;
  }

  @Option({
    flags: '--all-metadata',
    description:
      'Flush cache for all metadata names. Takes precedence over --metadataName.',
    required: false,
  })
  parseAllMetadata(): boolean {
    return true;
  }

  override async runMigrationCommand(
    passedParams: string[],
    options: FlatCacheFlushCommandOptions,
  ): Promise<void> {
    if (!options.allMetadata && this.metadataNames.length === 0) {
      this.logger.error(
        'Either --all-metadata or at least one --metadataName must be provided.',
      );

      return;
    }

    const validatedMetadataNames = this.validateAndExpandMetadataNames({
      inputMetadataNames: this.metadataNames,
      allMetadata: options.allMetadata,
    });

    if (validatedMetadataNames === null) {
      return;
    }

    this.flatMapsKeysToFlush = this.computeFlatMapsKeysWithRelated(
      validatedMetadataNames,
    );

    this.logger.log(
      `Will flush cache for the following flat maps keys: ${this.flatMapsKeysToFlush.join(', ')}`,
    );

    await super.runMigrationCommand(passedParams, options);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    await this.workspaceMigrationRunnerService.invalidateCache({
      allFlatEntityMapsKeys: this.flatMapsKeysToFlush,
      workspaceId,
    });

    this.logger.log(
      `Successfully invalidated cache for workspace: ${workspaceId}`,
    );
  }

  private validateAndExpandMetadataNames({
    inputMetadataNames,
    allMetadata,
  }: {
    inputMetadataNames: string[];
    allMetadata?: boolean;
  }): AllMetadataName[] | null {
    const validMetadataNames = Object.keys(
      ALL_METADATA_NAME,
    ) as AllMetadataName[];

    if (allMetadata) {
      this.logger.log('Using all metadata names');

      return validMetadataNames;
    }

    const invalidNames = inputMetadataNames.filter(
      (name) => !validMetadataNames.includes(name as AllMetadataName),
    );

    if (invalidNames.length > 0) {
      this.logger.error(
        `Invalid metadata name(s) provided: ${invalidNames.join(', ')}`,
      );
      this.logger.error(
        `Valid metadata names are: ${validMetadataNames.join(', ')}, or use --all-metadata`,
      );

      return null;
    }

    return inputMetadataNames as AllMetadataName[];
  }

  private computeFlatMapsKeysWithRelated(
    metadataNames: AllMetadataName[],
  ): ReturnType<typeof getMetadataFlatEntityMapsKey>[] {
    const allMetadataNamesToFlush = [
      ...new Set([
        ...metadataNames,
        ...metadataNames.flatMap(getMetadataRelatedMetadataNames),
      ]),
    ];

    const allFlatMapsKeys = allMetadataNamesToFlush.map(
      getMetadataFlatEntityMapsKey,
    );

    return allFlatMapsKeys;
  }
}
