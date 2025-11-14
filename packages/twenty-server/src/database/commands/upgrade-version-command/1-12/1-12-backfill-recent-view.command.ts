import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';
import { ViewFilterOperand } from 'twenty-shared/types';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ViewEntity } from 'src/engine/metadata-modules/view/entities/view.entity';
import { ViewType } from 'src/engine/metadata-modules/view/enums/view-type.enum';
import { ViewV2Service } from 'src/engine/metadata-modules/view/services/view-v2.service';
import { ViewFilterGroupLogicalOperator } from 'src/engine/metadata-modules/view-filter-group/enums/view-filter-group-logical-operator';
import { ViewFilterGroupService } from 'src/engine/metadata-modules/view-filter-group/services/view-filter-group.service';
import { ViewFilterV2Service } from 'src/engine/metadata-modules/view-filter/services/view-filter-v2.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';

@Command({
  name: 'upgrade:1-12:backfill-recent-view',
  description:
    'Create a system view "Recently View" with lastViewedAt PAST_1_WEEK filter for all objects that have lastViewedAt, if missing',
})
export class BackfillRecentViewCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,

    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,

    @InjectRepository(ViewEntity)
    private readonly viewRepository: Repository<ViewEntity>,

    private readonly viewService: ViewV2Service,
    private readonly viewFilterGroupService: ViewFilterGroupService,
    private readonly viewFilterV2Service: ViewFilterV2Service,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({ workspaceId, options }: RunOnWorkspaceArgs) {
    // Fetch all objects for this workspace
    const objects = await this.objectMetadataRepository.find({
      where: { workspaceId },
      relations: ['fields'],
      order: { nameSingular: 'ASC' },
    });

    let createdCount = 0;

    for (const object of objects) {
      // Ensure the object has a lastViewedAt field
      const lastViewed = object.fields.find((f) => f.name === 'lastViewedAt');

      if (!isDefined(lastViewed)) {
        continue;
      }

      const existingRecentView = await this.viewRepository.findOne({
        where: {
          workspaceId,
          objectMetadataId: object.id,
          name: 'Recently View',
        },
      });

      if (existingRecentView) {
        this.logger.log(
          `[${workspaceId}] ${object.nameSingular}: recent view already exists. Skipping.`,
        );
        continue;
      }

      if (options.dryRun) {
        this.logger.log(
          `[${workspaceId}] Would create recent view for ${object.nameSingular}`,
        );
        createdCount++;
        continue;
      }

      const recentView = await this.viewService.createOne({
        workspaceId,
        createViewInput: {
          objectMetadataId: object.id,
          name: 'Recently View',
          icon: 'IconClock',
          type: ViewType.TABLE,
        },
      });

      const rootGroup = await this.viewFilterGroupService.create({
        workspaceId,
        viewId: recentView.id,
        logicalOperator: ViewFilterGroupLogicalOperator.AND,
        positionInViewFilterGroup: 0,
      });

      await this.viewFilterV2Service.createOne({
        workspaceId,
        createViewFilterInput: {
          viewId: recentView.id,
          fieldMetadataId: lastViewed.id,
          viewFilterGroupId: rootGroup.id,
          operand: ViewFilterOperand.IS_RELATIVE,
          value: 'PAST_1_WEEK',
          positionInViewFilterGroup: 0,
        },
      });

      createdCount++;
      this.logger.log(
        `[${workspaceId}] Created recent view for ${object.nameSingular}`,
      );
    }

    this.logger.log(
      `[${workspaceId}] Completed backfill of recent view. Created: ${createdCount}`,
    );
  }
}
