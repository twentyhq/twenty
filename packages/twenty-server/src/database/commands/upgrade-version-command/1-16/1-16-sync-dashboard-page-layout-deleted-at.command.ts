import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { In, IsNull, Not, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { PageLayoutTabEntity } from 'src/engine/metadata-modules/page-layout-tab/entities/page-layout-tab.entity';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { PageLayoutEntity } from 'src/engine/metadata-modules/page-layout/entities/page-layout.entity';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import type { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Command({
  name: 'upgrade:1-16:sync-dashboard-page-layout-deleted-at',
  description:
    'Sync deletedAt status between dashboards and their associated page layouts, tabs and widgets',
})
export class SyncDashboardPageLayoutDeletedAtCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    SyncDashboardPageLayoutDeletedAtCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(PageLayoutEntity)
    private readonly pageLayoutRepository: Repository<PageLayoutEntity>,
    @InjectRepository(PageLayoutTabEntity)
    private readonly pageLayoutTabRepository: Repository<PageLayoutTabEntity>,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting sync of dashboard-page layout deletedAt for workspace ${workspaceId}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.twentyORMGlobalManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const dashboardRepository =
          await this.twentyORMGlobalManager.getRepository<DashboardWorkspaceEntity>(
            workspaceId,
            'dashboard',
            { shouldBypassPermissionChecks: true },
          );

        const dashboards = await dashboardRepository.find({
          withDeleted: true,
        });

        const pageLayouts = await this.pageLayoutRepository.find({
          where: {
            workspaceId,
            type: PageLayoutType.DASHBOARD,
          },
          withDeleted: true,
        });

        const dashboardsWithPageLayoutId = dashboards.filter((dashboard) =>
          isDefined(dashboard.pageLayoutId),
        ) as (DashboardWorkspaceEntity & { pageLayoutId: string })[];

        const dashboardByPageLayoutId = new Map(
          dashboardsWithPageLayoutId.map((dashboard) => [
            dashboard.pageLayoutId,
            dashboard,
          ]),
        );

        const pageLayoutByPageLayoutId = new Map(
          pageLayouts.map((pageLayout) => [pageLayout.id, pageLayout]),
        );

        const dryRun = options.dryRun ?? false;

        await this.destroyOrphanPageLayouts({
          pageLayouts,
          dashboardByPageLayoutId,
          workspaceId,
          dryRun,
        });

        await this.destroyOrphanDashboards({
          dashboards,
          pageLayoutByPageLayoutId,
          dashboardRepository,
          dryRun,
        });

        await this.softDeletePageLayoutsForSoftDeletedDashboards({
          dashboards,
          pageLayoutByPageLayoutId,
          workspaceId,
          dryRun,
        });

        await this.restorePageLayoutsForActiveDashboards({
          dashboards,
          pageLayoutByPageLayoutId,
          workspaceId,
          dryRun,
        });
      },
    );

    this.logger.log(
      `Completed sync of dashboard-page layout deletedAt for workspace ${workspaceId}`,
    );
  }

  private async destroyOrphanPageLayouts({
    pageLayouts,
    dashboardByPageLayoutId,
    workspaceId,
    dryRun,
  }: {
    pageLayouts: PageLayoutEntity[];
    dashboardByPageLayoutId: Map<string, DashboardWorkspaceEntity>;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const orphanPageLayouts = pageLayouts.filter(
      (pageLayout) => !dashboardByPageLayoutId.has(pageLayout.id),
    );

    if (orphanPageLayouts.length === 0) {
      this.logger.log(`No orphan page layouts found`);

      return;
    }

    this.logger.log(
      `Found ${orphanPageLayouts.length} orphan page layout(s) to destroy`,
    );

    const orphanPageLayoutIds = orphanPageLayouts.map(
      (pageLayout) => pageLayout.id,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would destroy ${orphanPageLayouts.length} orphan page layout(s)`,
      );

      return;
    }

    const tabsToDestroy = await this.pageLayoutTabRepository.find({
      where: {
        workspaceId,
        pageLayoutId: In(orphanPageLayoutIds),
      },
      withDeleted: true,
    });

    const tabIds = tabsToDestroy.map((tab) => tab.id);

    if (tabIds.length > 0) {
      await this.pageLayoutWidgetRepository.delete({
        workspaceId,
        pageLayoutTabId: In(tabIds),
      });

      this.logger.log(
        `Destroyed widgets for ${tabIds.length} tab(s) of orphan page layouts`,
      );

      await this.pageLayoutTabRepository.delete({
        workspaceId,
        pageLayoutId: In(orphanPageLayoutIds),
      });

      this.logger.log(
        `Destroyed ${tabIds.length} tab(s) of orphan page layouts`,
      );
    }

    await this.pageLayoutRepository.delete({
      workspaceId,
      id: In(orphanPageLayoutIds),
    });

    this.logger.log(
      `Destroyed ${orphanPageLayouts.length} orphan page layout(s)`,
    );
  }

  private async destroyOrphanDashboards({
    dashboards,
    pageLayoutByPageLayoutId,
    dashboardRepository,
    dryRun,
  }: {
    dashboards: DashboardWorkspaceEntity[];
    pageLayoutByPageLayoutId: Map<string, PageLayoutEntity>;
    dashboardRepository: Repository<DashboardWorkspaceEntity>;
    dryRun: boolean;
  }): Promise<void> {
    const orphanDashboards = dashboards.filter(
      (dashboard) =>
        !isDefined(dashboard.pageLayoutId) ||
        !pageLayoutByPageLayoutId.has(dashboard.pageLayoutId),
    );

    if (orphanDashboards.length === 0) {
      this.logger.log(`No orphan dashboards found`);

      return;
    }

    this.logger.log(
      `Found ${orphanDashboards.length} orphan dashboard(s) to destroy`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would destroy ${orphanDashboards.length} orphan dashboard(s)`,
      );

      return;
    }

    const orphanDashboardIds = orphanDashboards.map(
      (dashboard) => dashboard.id,
    );

    await dashboardRepository.delete({
      id: In(orphanDashboardIds),
    });

    this.logger.log(`Destroyed ${orphanDashboards.length} orphan dashboard(s)`);
  }

  private async softDeletePageLayoutsForSoftDeletedDashboards({
    dashboards,
    pageLayoutByPageLayoutId,
    workspaceId,
    dryRun,
  }: {
    dashboards: DashboardWorkspaceEntity[];
    pageLayoutByPageLayoutId: Map<string, PageLayoutEntity>;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const softDeletedDashboardsWithActivePageLayout = dashboards.filter(
      (dashboard) => {
        if (!isDefined(dashboard.deletedAt)) {
          return false;
        }

        if (!isDefined(dashboard.pageLayoutId)) {
          return false;
        }

        const pageLayout = pageLayoutByPageLayoutId.get(dashboard.pageLayoutId);

        return isDefined(pageLayout) && !isDefined(pageLayout.deletedAt);
      },
    );

    if (softDeletedDashboardsWithActivePageLayout.length === 0) {
      this.logger.log(
        `No soft deleted dashboards with active page layouts found`,
      );

      return;
    }

    this.logger.log(
      `Found ${softDeletedDashboardsWithActivePageLayout.length} soft deleted dashboard(s) with active page layout(s)`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would soft delete ${softDeletedDashboardsWithActivePageLayout.length} page layout(s) and their tabs/widgets`,
      );

      return;
    }

    for (const dashboard of softDeletedDashboardsWithActivePageLayout) {
      if (!isDefined(dashboard.pageLayoutId)) {
        continue;
      }

      const deletedAt = dashboard.deletedAt;

      const tabs = await this.pageLayoutTabRepository.find({
        where: {
          workspaceId,
          pageLayoutId: dashboard.pageLayoutId,
        },
      });

      const tabIds = tabs.map((tab) => tab.id);

      if (tabIds.length > 0) {
        await this.pageLayoutWidgetRepository.update(
          {
            workspaceId,
            pageLayoutTabId: In(tabIds),
            deletedAt: IsNull(),
          },
          { deletedAt },
        );

        await this.pageLayoutTabRepository.update(
          {
            workspaceId,
            pageLayoutId: dashboard.pageLayoutId,
            deletedAt: IsNull(),
          },
          { deletedAt },
        );
      }

      await this.pageLayoutRepository.update(
        {
          workspaceId,
          id: dashboard.pageLayoutId,
          deletedAt: IsNull(),
        },
        { deletedAt },
      );

      this.logger.log(
        `Soft deleted page layout ${dashboard.pageLayoutId} and its tabs/widgets for dashboard ${dashboard.id}`,
      );
    }
  }

  private async restorePageLayoutsForActiveDashboards({
    dashboards,
    pageLayoutByPageLayoutId,
    workspaceId,
    dryRun,
  }: {
    dashboards: DashboardWorkspaceEntity[];
    pageLayoutByPageLayoutId: Map<string, PageLayoutEntity>;
    workspaceId: string;
    dryRun: boolean;
  }): Promise<void> {
    const activeDashboardsWithSoftDeletedPageLayout = dashboards.filter(
      (dashboard) => {
        if (isDefined(dashboard.deletedAt)) {
          return false;
        }

        if (!isDefined(dashboard.pageLayoutId)) {
          return false;
        }

        const pageLayout = pageLayoutByPageLayoutId.get(dashboard.pageLayoutId);

        return isDefined(pageLayout) && isDefined(pageLayout.deletedAt);
      },
    );

    if (activeDashboardsWithSoftDeletedPageLayout.length === 0) {
      this.logger.log(
        `No active dashboards with soft deleted page layouts found`,
      );

      return;
    }

    this.logger.log(
      `Found ${activeDashboardsWithSoftDeletedPageLayout.length} active dashboard(s) with soft deleted page layout(s)`,
    );

    if (dryRun) {
      this.logger.log(
        `[DRY RUN] Would restore ${activeDashboardsWithSoftDeletedPageLayout.length} page layout(s) and their tabs/widgets`,
      );

      return;
    }

    for (const dashboard of activeDashboardsWithSoftDeletedPageLayout) {
      if (!isDefined(dashboard.pageLayoutId)) {
        continue;
      }

      const tabs = await this.pageLayoutTabRepository.find({
        where: {
          workspaceId,
          pageLayoutId: dashboard.pageLayoutId,
          deletedAt: Not(IsNull()),
        },
        withDeleted: true,
      });

      const tabIds = tabs.map((tab) => tab.id);

      if (tabIds.length > 0) {
        await this.pageLayoutWidgetRepository.update(
          {
            workspaceId,
            pageLayoutTabId: In(tabIds),
            deletedAt: Not(IsNull()),
          },
          { deletedAt: null },
        );

        await this.pageLayoutTabRepository.update(
          {
            workspaceId,
            pageLayoutId: dashboard.pageLayoutId,
            deletedAt: Not(IsNull()),
          },
          { deletedAt: null },
        );
      }

      await this.pageLayoutRepository.update(
        {
          workspaceId,
          id: dashboard.pageLayoutId,
          deletedAt: Not(IsNull()),
        },
        { deletedAt: null },
      );

      this.logger.log(
        `Restored page layout ${dashboard.pageLayoutId} and its tabs/widgets for dashboard ${dashboard.id}`,
      );
    }
  }
}
