import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/display/components/SidePanelCommandMenuItemDisplayPage';
import { SidePanelCommandMenuItemEditPage } from '@/command-menu-item/edit/components/SidePanelCommandMenuItemEditPage';
import { SidePanelNavigationMenuItemEditPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNavigationMenuItemEditPage';
import { SidePanelNewSidebarItemPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemPage';
import { SidePanelAiChatThreadsPage } from '@/side-panel/pages/ai-chat-threads/components/SidePanelAiChatThreadsPage';
import { SidePanelAskAiPage } from '@/side-panel/pages/ask-ai/components/SidePanelAskAiPage';
import { SidePanelCalendarEventPage } from '@/side-panel/pages/calendar-event/components/SidePanelCalendarEventPage';
import { SidePanelComposeEmailPage } from '@/side-panel/pages/compose-email/components/SidePanelComposeEmailPage';
import { SidePanelFrontComponentPage } from '@/side-panel/pages/front-component/components/SidePanelFrontComponentPage';
import { SidePanelDashboardChartSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardChartSettings';
import { SidePanelDashboardIframeSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardIframeSettings';
import { SidePanelDashboardRecordTableSettings } from '@/side-panel/pages/page-layout/components/dashboard/SidePanelDashboardRecordTableSettings';
import { SidePanelRecordPageFieldSettings } from '@/side-panel/pages/page-layout/components/record-page/SidePanelRecordPageFieldSettings';
import { SidePanelRecordPageFieldsSettings } from '@/side-panel/pages/page-layout/components/record-page/SidePanelRecordPageFieldsSettings';
import { SidePanelPageLayoutDashboardWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutDashboardWidgetTypeSelect';
import { SidePanelPageLayoutRecordPageWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordPageWidgetTypeSelect';
import { SidePanelPageLayoutTabSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettings';
import { SidePanelMergeRecordPage } from '@/side-panel/pages/record-page/components/SidePanelMergeRecordPage';
import { SidePanelRecordPage } from '@/side-panel/pages/record-page/components/SidePanelRecordPage';
import { SidePanelUpdateMultipleRecords } from '@/side-panel/pages/record-page/components/SidePanelUpdateMultipleRecords';
import { SidePanelEditRichTextPage } from '@/side-panel/pages/rich-text-page/components/SidePanelEditRichTextPage';
import { SidePanelSearchRecordsPage } from '@/side-panel/pages/search/components/SidePanelSearchRecordsPage';
import { SidePanelWorkflowCreateStep } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStep';
import { SidePanelWorkflowEditStep } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStep';
import { SidePanelWorkflowEditStepType } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepType';
import { SidePanelWorkflowRunViewStep } from '@/side-panel/pages/workflow/step/view-run/components/SidePanelWorkflowRunViewStep';
import { SidePanelWorkflowViewStep } from '@/side-panel/pages/workflow/step/view/components/SidePanelWorkflowViewStep';
import { SidePanelWorkflowSelectTriggerType } from '@/side-panel/pages/workflow/trigger-type/components/SidePanelWorkflowSelectTriggerType';
import { SidePanelPages } from 'twenty-shared/types';

export const SIDE_PANEL_PAGES_CONFIG = new Map<SidePanelPages, React.ReactNode>(
  [
    [
      SidePanelPages.CommandMenuDisplay,
      <SidePanelCommandMenuItemDisplayPage />,
    ],
    [SidePanelPages.ViewRecord, <SidePanelRecordPage />],
    [SidePanelPages.MergeRecords, <SidePanelMergeRecordPage />],
    [SidePanelPages.UpdateRecords, <SidePanelUpdateMultipleRecords />],
    [SidePanelPages.ViewCalendarEvent, <SidePanelCalendarEventPage />],
    [SidePanelPages.EditRichText, <SidePanelEditRichTextPage />],
    [
      SidePanelPages.WorkflowTriggerSelectType,
      <SidePanelWorkflowSelectTriggerType />,
    ],
    [SidePanelPages.WorkflowStepCreate, <SidePanelWorkflowCreateStep />],
    [SidePanelPages.WorkflowStepEditType, <SidePanelWorkflowEditStepType />],
    [SidePanelPages.WorkflowStepEdit, <SidePanelWorkflowEditStep />],
    [SidePanelPages.WorkflowStepView, <SidePanelWorkflowViewStep />],
    [SidePanelPages.WorkflowRunStepView, <SidePanelWorkflowRunViewStep />],
    [SidePanelPages.SearchRecords, <SidePanelSearchRecordsPage />],
    [SidePanelPages.AskAI, <SidePanelAskAiPage />],
    [SidePanelPages.ViewPreviousAiChats, <SidePanelAiChatThreadsPage />],
    [
      SidePanelPages.PageLayoutDashboardWidgetTypeSelect,
      <SidePanelPageLayoutDashboardWidgetTypeSelect />,
    ],
    [
      SidePanelPages.DashboardChartSettings,
      <SidePanelDashboardChartSettings />,
    ],
    [
      SidePanelPages.DashboardIframeSettings,
      <SidePanelDashboardIframeSettings />,
    ],
    [SidePanelPages.PageLayoutTabSettings, <SidePanelPageLayoutTabSettings />],
    [
      SidePanelPages.DashboardRecordTableSettings,
      <SidePanelDashboardRecordTableSettings />,
    ],
    [
      SidePanelPages.RecordPageFieldsSettings,
      <SidePanelRecordPageFieldsSettings />,
    ],
    [
      SidePanelPages.RecordPageFieldSettings,
      <SidePanelRecordPageFieldSettings />,
    ],
    [SidePanelPages.ViewFrontComponent, <SidePanelFrontComponentPage />],
    [
      SidePanelPages.PageLayoutRecordPageWidgetTypeSelect,
      <SidePanelPageLayoutRecordPageWidgetTypeSelect />,
    ],
    [
      SidePanelPages.NavigationMenuItemEdit,
      <SidePanelNavigationMenuItemEditPage />,
    ],
    [SidePanelPages.NavigationMenuAddItem, <SidePanelNewSidebarItemPage />],
    [SidePanelPages.CommandMenuEdit, <SidePanelCommandMenuItemEditPage />],
    [SidePanelPages.ComposeEmail, <SidePanelComposeEmailPage />],
  ],
);
