import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import {
  MigrationCommandOptions,
  MigrationCommandRunner,
} from 'src/database/commands/command-runners/migration.command-runner';
import { ViewGroupEntity } from 'src/engine/metadata-modules/view-group/entities/view-group.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';

@Command({
  name: 'upgrade:1-13:backfill:view-main-group-by-field-metadata-id',
  description:
    'Backfill mainGroupByFieldMetadataId on views and clean up inconsistent viewGroups',
})
export class BackfillViewMainGroupByFieldMetadataIdCommand extends MigrationCommandRunner {
  constructor(
    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,
    @InjectRepository(ViewGroupEntity)
    private readonly viewGroupRepository: Repository<ViewGroupEntity>,
  ) {
    super();
  }

  override async runMigrationCommand(
    _passedParams: string[],
    options: MigrationCommandOptions,
  ): Promise<void> {
    await this.backfillMainGroupByFieldMetadataId(options);
    await this.cleanupInconsistentViewGroups(options);
  }

  private async backfillMainGroupByFieldMetadataId(
    options: MigrationCommandOptions,
  ): Promise<void> {
    this.logger.log('Starting backfill of mainGroupByFieldMetadataId...');

    const viewsToBackfill = await this.viewRepository.find({
      where: {
        mainGroupByFieldMetadataId: IsNull(),
      },
      select: ['id', 'workspaceId'],
    });

    this.logger.log(
      `Found ${viewsToBackfill.length} views with null mainGroupByFieldMetadataId`,
    );

    let backfilledCount = 0;
    let inconsistentViewsCount = 0;

    for (const view of viewsToBackfill) {
      const nonDeletedViewGroups = await this.viewGroupRepository.find({
        where: {
          viewId: view.id,
          deletedAt: IsNull(),
        },
        select: ['id', 'fieldMetadataId'],
      });

      if (nonDeletedViewGroups.length === 0) {
        continue;
      }

      const uniqueFieldMetadataIds = [
        ...new Set(nonDeletedViewGroups.map((vg) => vg.fieldMetadataId)),
      ];

      if (uniqueFieldMetadataIds.length === 1) {
        const fieldMetadataId = uniqueFieldMetadataIds[0];

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would backfill view ${view.id} (workspace ${view.workspaceId}) with fieldMetadataId ${fieldMetadataId}`,
          );
        } else {
          await this.viewRepository.update(
            { id: view.id },
            { mainGroupByFieldMetadataId: fieldMetadataId },
          );
          this.logger.log(
            `Backfilled view ${view.id} (workspace ${view.workspaceId}) with fieldMetadataId ${fieldMetadataId}`,
          );
        }
        backfilledCount++;
      } else {
        this.logger.error(
          `Inconsistency detected for view ${view.id} (workspace ${view.workspaceId}): found ${uniqueFieldMetadataIds.length} different fieldMetadataIds`,
        );

        const fieldMetadataIdCounts = new Map<string, number>();

        for (const vg of nonDeletedViewGroups) {
          const count = fieldMetadataIdCounts.get(vg.fieldMetadataId) || 0;

          fieldMetadataIdCounts.set(vg.fieldMetadataId, count + 1);
        }

        let mostNumerousFieldMetadataId = '';
        let maxCount = 0;

        for (const [
          fieldMetadataId,
          count,
        ] of fieldMetadataIdCounts.entries()) {
          if (count > maxCount) {
            maxCount = count;
            mostNumerousFieldMetadataId = fieldMetadataId;
          }
        }

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would backfill view ${view.id} (workspace ${view.workspaceId}) with fieldMetadataId ${mostNumerousFieldMetadataId} (most numerous, found ${maxCount} occurrences)`,
          );
        } else {
          await this.viewRepository.update(
            { id: view.id },
            { mainGroupByFieldMetadataId: mostNumerousFieldMetadataId },
          );
          this.logger.log(
            `Backfilled view ${view.id} (workspace ${view.workspaceId}) with fieldMetadataId ${mostNumerousFieldMetadataId} (most numerous, found ${maxCount} occurrences)`,
          );
        }
        backfilledCount++;
        inconsistentViewsCount++;
      }
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would have ' : ''}Backfilled ${backfilledCount} views${inconsistentViewsCount > 0 ? ` (${inconsistentViewsCount} with inconsistencies)` : ''}`,
    );
  }

  private async cleanupInconsistentViewGroups(
    options: MigrationCommandOptions,
  ): Promise<void> {
    this.logger.log('Starting cleanup of inconsistent viewGroups...');

    const viewsWithMainGroupBy = await this.viewRepository.find({
      where: {
        mainGroupByFieldMetadataId: Not(IsNull()),
      },
      select: ['id', 'mainGroupByFieldMetadataId'],
    });

    this.logger.log(
      `Found ${viewsWithMainGroupBy.length} views with mainGroupByFieldMetadataId set`,
    );

    let totalDeletedCount = 0;

    for (const view of viewsWithMainGroupBy) {
      if (!isDefined(view.mainGroupByFieldMetadataId)) {
        continue;
      }

      const inconsistentViewGroups = await this.viewGroupRepository.find({
        where: {
          viewId: view.id,
          fieldMetadataId: Not(view.mainGroupByFieldMetadataId),
        },
        select: ['id'],
      });

      if (inconsistentViewGroups.length === 0) {
        continue;
      }

      const viewGroupIds = inconsistentViewGroups.map((vg) => vg.id);

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would delete ${inconsistentViewGroups.length} viewGroups from view ${view.id}`,
        );
      } else {
        await this.viewGroupRepository.delete({ id: In(viewGroupIds) });
        this.logger.log(
          `Deleted ${inconsistentViewGroups.length} viewGroups from view ${view.id}`,
        );
      }
      totalDeletedCount += inconsistentViewGroups.length;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would have ' : ''}Deleted ${totalDeletedCount} inconsistent viewGroups`,
    );
  }
}
