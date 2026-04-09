import { TEST_IFRAME_CONFIG } from 'test/integration/constants/widget-configuration-test-data.constants';
import {
  createTestDashboardWithGraphQL,
  destroyDashboardWithGraphQL,
  findDashboardWithGraphQL,
} from 'test/integration/metadata/suites/dashboard/utils/dashboard-graphql.util';
import { createOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/create-one-page-layout-tab.util';
import { destroyOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/destroy-one-page-layout-tab.util';
import { updateOnePageLayoutTab } from 'test/integration/metadata/suites/page-layout-tab/utils/update-one-page-layout-tab.util';
import { createOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/create-one-page-layout-widget.util';
import { destroyOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/destroy-one-page-layout-widget.util';
import { updateOnePageLayoutWidget } from 'test/integration/metadata/suites/page-layout-widget/utils/update-one-page-layout-widget.util';
import { createOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/create-one-page-layout.util';
import { destroyOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/destroy-one-page-layout.util';
import { updateOnePageLayout } from 'test/integration/metadata/suites/page-layout/utils/update-one-page-layout.util';

import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { PageLayoutType } from 'src/engine/metadata-modules/page-layout/enums/page-layout-type.enum';

type TestContext = {
  pageLayoutId: string;
  tabId: string;
  widgetId: string;
  dashboardId: string;
};

const createTestContext = async (): Promise<TestContext> => {
  const { data: pageLayoutData } = await createOnePageLayout({
    expectToFail: false,
    input: {
      name: 'Page Layout for Dashboard Sync Test',
      type: PageLayoutType.DASHBOARD,
    },
  });

  const pageLayoutId = pageLayoutData.createPageLayout.id;

  const { data: tabData } = await createOnePageLayoutTab({
    expectToFail: false,
    input: {
      title: 'Tab for Dashboard Sync Test',
      pageLayoutId,
    },
  });

  const tabId = tabData.createPageLayoutTab.id;

  const { data: widgetData } = await createOnePageLayoutWidget({
    expectToFail: false,
    input: {
      title: 'Widget for Dashboard Sync Test',
      type: WidgetType.IFRAME,
      pageLayoutTabId: tabId,
      gridPosition: {
        row: 0,
        column: 0,
        rowSpan: 1,
        columnSpan: 1,
      },
      configuration: TEST_IFRAME_CONFIG,
    },
  });

  const widgetId = widgetData.createPageLayoutWidget.id;

  const dashboard = await createTestDashboardWithGraphQL({
    title: 'Dashboard for Sync Test',
    pageLayoutId,
  });

  return {
    pageLayoutId,
    tabId,
    widgetId,
    dashboardId: dashboard.id,
  };
};

const cleanupTestContext = async (context: TestContext): Promise<void> => {
  await destroyDashboardWithGraphQL(context.dashboardId);
};

const assertDashboardUpdatedAtIncreased = async (
  dashboardId: string,
  operation: () => Promise<void>,
): Promise<void> => {
  const dashboardBefore = await findDashboardWithGraphQL(dashboardId);

  expect(dashboardBefore).not.toBeNull();

  const updatedAtBefore = new Date(dashboardBefore!.updatedAt);

  await operation();

  const dashboardAfter = await findDashboardWithGraphQL(dashboardId);

  expect(dashboardAfter).not.toBeNull();

  const updatedAtAfter = new Date(dashboardAfter!.updatedAt);

  const isIncreased = updatedAtAfter > updatedAtBefore;

  expect(isIncreased).toBe(true);
};

describe('Dashboard updatedAt should sync when linked page layout entities change', () => {
  describe('Widget operations', () => {
    let context: TestContext;
    let additionalWidgetId: string | undefined;

    beforeEach(async () => {
      context = await createTestContext();
    });

    afterEach(async () => {
      if (additionalWidgetId) {
        await destroyOnePageLayoutWidget({
          expectToFail: false,
          input: { id: additionalWidgetId },
        });
        additionalWidgetId = undefined;
      }

      await cleanupTestContext(context);
    });

    it('should update dashboard updatedAt when widget is created', async () => {
      await assertDashboardUpdatedAtIncreased(context.dashboardId, async () => {
        const { data: widgetData } = await createOnePageLayoutWidget({
          expectToFail: false,
          input: {
            title: 'New Widget for Dashboard Sync Test',
            type: WidgetType.IFRAME,
            pageLayoutTabId: context.tabId,
            gridPosition: {
              row: 1,
              column: 0,
              rowSpan: 1,
              columnSpan: 1,
            },
            configuration: TEST_IFRAME_CONFIG,
          },
        });

        additionalWidgetId = widgetData.createPageLayoutWidget.id;
      });
    });

    it('should update dashboard updatedAt when widget is updated', async () => {
      await assertDashboardUpdatedAtIncreased(context.dashboardId, async () => {
        await updateOnePageLayoutWidget({
          expectToFail: false,
          input: { id: context.widgetId, title: 'Updated Widget Title' },
        });
      });
    });
  });

  describe('Tab operations', () => {
    let context: TestContext;
    let additionalTabId: string | undefined;

    beforeEach(async () => {
      context = await createTestContext();
    });

    afterEach(async () => {
      if (additionalTabId) {
        await destroyOnePageLayoutTab({
          expectToFail: false,
          input: { id: additionalTabId },
        });
        additionalTabId = undefined;
      }
      await cleanupTestContext(context);
    });

    it('should update dashboard updatedAt when tab is created', async () => {
      await assertDashboardUpdatedAtIncreased(context.dashboardId, async () => {
        const { data: tabData } = await createOnePageLayoutTab({
          expectToFail: false,
          input: {
            title: 'New Tab for Dashboard Sync Test',
            pageLayoutId: context.pageLayoutId,
          },
        });

        additionalTabId = tabData.createPageLayoutTab.id;
      });
    });

    it('should update dashboard updatedAt when tab is updated', async () => {
      await assertDashboardUpdatedAtIncreased(context.dashboardId, async () => {
        await updateOnePageLayoutTab({
          expectToFail: false,
          input: { id: context.tabId, title: 'Updated Tab Title' },
        });
      });
    });
  });

  describe('Page layout operations', () => {
    let context: TestContext;

    beforeEach(async () => {
      context = await createTestContext();
    });

    afterEach(async () => {
      await cleanupTestContext(context);
    });

    it('should update dashboard updatedAt when page layout is updated', async () => {
      await assertDashboardUpdatedAtIncreased(context.dashboardId, async () => {
        await updateOnePageLayout({
          expectToFail: false,
          input: {
            id: context.pageLayoutId,
            name: 'Updated Page Layout Name',
          },
        });
      });
    });
  });

  describe('Non-dashboard page layout operations should not trigger sync', () => {
    let nonDashboardPageLayoutId: string;
    let dashboardContext: TestContext;

    beforeEach(async () => {
      dashboardContext = await createTestContext();

      const { data: pageLayoutData } = await createOnePageLayout({
        expectToFail: false,
        input: {
          name: 'Non-Dashboard Page Layout',
          type: PageLayoutType.RECORD_INDEX,
        },
      });

      nonDashboardPageLayoutId = pageLayoutData.createPageLayout.id;
    });

    afterEach(async () => {
      await destroyOnePageLayout({
        expectToFail: false,
        input: { id: nonDashboardPageLayoutId },
      });

      await cleanupTestContext(dashboardContext);
    });

    it('should not update existing dashboard updatedAt when non-dashboard page layout is updated', async () => {
      const dashboardBefore = await findDashboardWithGraphQL(
        dashboardContext.dashboardId,
      );

      expect(dashboardBefore).not.toBeNull();

      const updatedAtBefore = new Date(dashboardBefore!.updatedAt);

      await updateOnePageLayout({
        expectToFail: false,
        input: {
          id: nonDashboardPageLayoutId,
          name: 'Updated Non-Dashboard Page Layout',
        },
      });

      const dashboardAfter = await findDashboardWithGraphQL(
        dashboardContext.dashboardId,
      );

      expect(dashboardAfter).not.toBeNull();

      const updatedAtAfter = new Date(dashboardAfter!.updatedAt);

      expect(updatedAtAfter.getTime()).toBe(updatedAtBefore.getTime());
    });
  });
});
