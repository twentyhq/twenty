import { SidePanelCommandMenuItemDisplayPage } from '@/command-menu-item/server-items/display/components/SidePanelCommandMenuItemDisplayPage';
import { SidePanelCommandMenuItemEditPage } from '@/command-menu-item/server-items/edit/components/SidePanelCommandMenuItemEditPage';
import { SidePanelNavigationMenuItemEditPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNavigationMenuItemEditPage';
import { SidePanelNewSidebarItemPage } from '@/navigation-menu-item/edit/side-panel/components/SidePanelNewSidebarItemPage';
import { SidePanelAIChatThreadsPage } from '@/side-panel/pages/ai-chat-threads/components/SidePanelAIChatThreadsPage';
import { SidePanelAskAIPage } from '@/side-panel/pages/ask-ai/components/SidePanelAskAIPage';
import { SidePanelCalendarEventPage } from '@/side-panel/pages/calendar-event/components/SidePanelCalendarEventPage';
import { SidePanelFrontComponentPage } from '@/side-panel/pages/front-component/components/SidePanelFrontComponentPage';
import { SidePanelMessageThreadPage } from '@/side-panel/pages/message-thread/components/SidePanelMessageThreadPage';
import { SidePanelPageLayoutChartSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutChartSettings';
import { SidePanelPageLayoutFieldSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutFieldSettings';
import { SidePanelPageLayoutFieldsSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutFieldsSettings';
import { SidePanelPageLayoutIframeSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutIframeSettings';
import { SidePanelPageLayoutRecordTableSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutRecordTableSettings';
import { SidePanelPageLayoutTabSettings } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutTabSettings';
import { SidePanelPageLayoutWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/SidePanelPageLayoutWidgetTypeSelect';
import { SidePanelMergeRecordPage } from '@/side-panel/pages/record-page/components/SidePanelMergeRecordPage';
import { SidePanelRecordPage } from '@/side-panel/pages/record-page/components/SidePanelRecordPage';
import { SidePanelUpdateMultipleRecords } from '@/side-panel/pages/record-page/components/SidePanelUpdateMultipleRecords';
import { SidePanelEditRichTextPage } from '@/side-panel/pages/rich-text-page/components/SidePanelEditRichTextPage';
import { SidePanelRootPage } from '@/side-panel/pages/root/components/SidePanelRootPage';
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
    [SidePanelPages.ViewEmailThread, <SidePanelMessageThreadPage />],
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
    [SidePanelPages.AskAI, <SidePanelAskAIPage />],
    [SidePanelPages.ViewPreviousAIChats, <SidePanelAIChatThreadsPage />],
    [
      SidePanelPages.PageLayoutWidgetTypeSelect,
      <SidePanelPageLayoutWidgetTypeSelect />,
    ],
    [
      SidePanelPages.PageLayoutGraphTypeSelect,
      <SidePanelPageLayoutChartSettings />,
    ],
    [
      SidePanelPages.PageLayoutIframeSettings,
      <SidePanelPageLayoutIframeSettings />,
    ],
    [SidePanelPages.PageLayoutTabSettings, <SidePanelPageLayoutTabSettings />],
    [
      SidePanelPages.PageLayoutFieldsSettings,
      <SidePanelPageLayoutFieldsSettings />,
    ],
    [
      SidePanelPages.PageLayoutFieldSettings,
      <SidePanelPageLayoutFieldSettings />,
    ],
    [
      SidePanelPages.PageLayoutRecordTableSettings,
      <SidePanelPageLayoutRecordTableSettings />,
    ],
    [SidePanelPages.ViewFrontComponent, <SidePanelFrontComponentPage />],
    [
      SidePanelPages.NavigationMenuItemEdit,
      <SidePanelNavigationMenuItemEditPage />,
    ],
    [SidePanelPages.NavigationMenuAddItem, <SidePanelNewSidebarItemPage />],
    [SidePanelPages.CommandMenuEdit, <SidePanelCommandMenuItemEditPage />],
  ],
);
