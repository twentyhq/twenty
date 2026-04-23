import { z } from 'zod';

import {
  type DashboardToolContext,
  type DashboardToolDependencies,
} from 'src/modules/dashboard/tools/types/dashboard-tool-dependencies.type';

const addDashboardTabSchema = z.object({
  pageLayoutId: z
    .string()
    .uuid()
    .describe(
      'The page layout UUID of the dashboard (from get_dashboard result)',
    ),
  title: z.string().describe('Title for the new tab'),
  position: z
    .number()
    .int()
    .min(0)
    .optional()
    .describe(
      'Tab position (0-based). Defaults to after the last existing tab.',
    ),
});

export const createAddDashboardTabTool = (
  deps: Pick<
    DashboardToolDependencies,
    'pageLayoutTabService' | 'pageLayoutService'
  >,
  context: DashboardToolContext,
) => ({
  name: 'add_dashboard_tab' as const,
  description: `Add a new tab to an existing dashboard.

Use get_dashboard first to get the pageLayoutId and see existing tabs.
After creating a tab, use add_dashboard_widget with the returned tab ID to add widgets.`,
  inputSchema: addDashboardTabSchema,
  execute: async (parameters: {
    pageLayoutId: string;
    title: string;
    position?: number;
  }) => {
    try {
      const pageLayout = await deps.pageLayoutService.findByIdOrThrow({
        id: parameters.pageLayoutId,
        workspaceId: context.workspaceId,
      });

      const existingTabCount = pageLayout.tabs?.length ?? 0;
      const position = parameters.position ?? existingTabCount;

      const tab = await deps.pageLayoutTabService.create({
        createPageLayoutTabInput: {
          title: parameters.title,
          pageLayoutId: parameters.pageLayoutId,
          position,
        },
        workspaceId: context.workspaceId,
      });

      return {
        success: true,
        message: `Tab "${parameters.title}" added to dashboard`,
        result: {
          pageLayoutTabId: tab.id,
          title: tab.title,
          position: tab.position,
          pageLayoutId: parameters.pageLayoutId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      return {
        success: false,
        message: `Failed to add tab: ${errorMessage}`,
        error: errorMessage,
      };
    }
  },
});
