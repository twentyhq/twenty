import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';
import { In } from 'typeorm';

import { PageLayoutTabService } from 'src/engine/metadata-modules/page-layout-tab/services/page-layout-tab.service';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';
import { PageLayoutService } from 'src/engine/metadata-modules/page-layout/services/page-layout.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import type { DashboardWorkspaceEntity } from 'src/modules/dashboard/standard-objects/dashboard.workspace-entity';

@Injectable()
export class DashboardToPageLayoutSyncService {
  constructor(
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly pageLayoutService: PageLayoutService,
    private readonly pageLayoutTabService: PageLayoutTabService,
  ) {}

  public async createPageLayoutForDashboard({
    workspaceId,
  }: {
    workspaceId: string;
  }): Promise<string> {
    const pageLayout = await this.pageLayoutService.create({
      createPageLayoutInput: {
        type: PageLayoutType.DASHBOARD,
        objectMetadataId: null,
        name: 'Dashboard Layout',
      },
      workspaceId,
    });

    await this.pageLayoutTabService.create({
      createPageLayoutTabInput: {
        title: 'Tab 1',
        pageLayoutId: pageLayout.id,
      },
      workspaceId,
    });

    return pageLayout.id;
  }

  public async destroyPageLayoutsForDashboards({
    dashboardIds,
    workspaceId,
  }: {
    dashboardIds: string[];
    workspaceId: string;
  }): Promise<void> {
    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(async () => {
      const dashboardRepository =
        await this.globalWorkspaceOrmManager.getRepository<DashboardWorkspaceEntity>(
          workspaceId,
          'dashboard',
          { shouldBypassPermissionChecks: true },
        );

      const dashboards = await dashboardRepository.find({
        where: {
          id: In(dashboardIds),
        },
        withDeleted: true,
      });

      const pageLayoutIds = dashboards
        .map((dashboard) => dashboard.pageLayoutId)
        .filter(isDefined);

      await this.pageLayoutService.destroyMany({
        ids: pageLayoutIds,
        workspaceId,
      });
    }, authContext);
  }
}
