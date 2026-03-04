import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { SidePanelAIChatThreadsPage } from '@/side-panel/pages/AIChatThreads/components/SidePanelAIChatThreadsPage';
import { SidePanelAskAIPage } from '@/side-panel/pages/ask-ai/components/SidePanelAskAIPage';
import { SidePanelCalendarEventPage } from '@/side-panel/pages/calendar-event/components/SidePanelCalendarEventPage';
import { SidePanelFrontComponentPage } from '@/side-panel/pages/front-component/components/SidePanelFrontComponentPage';
import { SidePanelMessageThreadPage } from '@/side-panel/pages/message-thread/components/SidePanelMessageThreadPage';
import { SidePanelNavigationMenuItemEditPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNavigationMenuItemEditPage';
import { SidePanelNewSidebarItemPage } from '@/side-panel/pages/navigation-menu-item/components/SidePanelNewSidebarItemPage';
import { CommandMenuPageLayoutChartSettings } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutChartSettings';
import { CommandMenuPageLayoutFieldsLayout } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutFieldsLayout';
import { CommandMenuPageLayoutFieldsSettings } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutFieldsSettings';
import { CommandMenuPageLayoutGraphFilter } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutGraphFilter';
import { CommandMenuPageLayoutIframeSettings } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutIframeSettings';
import { CommandMenuPageLayoutTabSettings } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutTabSettings';
import { CommandMenuPageLayoutWidgetTypeSelect } from '@/side-panel/pages/page-layout/components/CommandMenuPageLayoutWidgetTypeSelect';
import { SidePanelMergeRecordPage } from '@/side-panel/pages/record-page/components/SidePanelMergeRecordPage';
import { SidePanelRecordPage } from '@/side-panel/pages/record-page/components/SidePanelRecordPage';
import { CommandMenuUpdateMultipleRecords } from '@/side-panel/pages/record-page/components/CommandMenuUpdateMultipleRecords';
import { SidePanelEditRichTextPage } from '@/side-panel/pages/rich-text-page/components/SidePanelEditRichTextPage';
import { SidePanelSearchRecordsPage } from '@/side-panel/pages/search/components/SidePanelSearchRecordsPage';
import { CommandMenuWorkflowCreateStep } from '@/side-panel/pages/workflow/step/create/components/CommandMenuWorkflowCreateStep';
import { CommandMenuWorkflowEditStep } from '@/side-panel/pages/workflow/step/edit/components/CommandMenuWorkflowEditStep';
import { CommandMenuWorkflowEditStepType } from '@/side-panel/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepType';
import { CommandMenuWorkflowRunViewStep } from '@/side-panel/pages/workflow/step/view-run/components/CommandMenuWorkflowRunViewStep';
import { CommandMenuWorkflowViewStep } from '@/side-panel/pages/workflow/step/view/components/CommandMenuWorkflowViewStep';
import { CommandMenuWorkflowSelectTriggerType } from '@/side-panel/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerType';
import { SidePanelPages } from 'twenty-shared/types';

export const SIDE_PANEL_PAGES_CONFIG = new Map<
  SidePanelPages,
  React.ReactNode
>([
  [SidePanelPages.Root, <CommandMenu />],
  [SidePanelPages.ViewRecord, <SidePanelRecordPage />],
  [SidePanelPages.MergeRecords, <SidePanelMergeRecordPage />],
  [SidePanelPages.UpdateRecords, <CommandMenuUpdateMultipleRecords />],
  [SidePanelPages.ViewEmailThread, <SidePanelMessageThreadPage />],
  [SidePanelPages.ViewCalendarEvent, <SidePanelCalendarEventPage />],
  [SidePanelPages.EditRichText, <SidePanelEditRichTextPage />],
  [
    SidePanelPages.WorkflowTriggerSelectType,
    <CommandMenuWorkflowSelectTriggerType />,
  ],
  [SidePanelPages.WorkflowStepCreate, <CommandMenuWorkflowCreateStep />],
  [SidePanelPages.WorkflowStepEditType, <CommandMenuWorkflowEditStepType />],
  [SidePanelPages.WorkflowStepEdit, <CommandMenuWorkflowEditStep />],
  [SidePanelPages.WorkflowStepView, <CommandMenuWorkflowViewStep />],
  [SidePanelPages.WorkflowRunStepView, <CommandMenuWorkflowRunViewStep />],
  [SidePanelPages.SearchRecords, <SidePanelSearchRecordsPage />],
  [SidePanelPages.AskAI, <SidePanelAskAIPage />],
  [SidePanelPages.ViewPreviousAIChats, <SidePanelAIChatThreadsPage />],
  [
    SidePanelPages.PageLayoutWidgetTypeSelect,
    <CommandMenuPageLayoutWidgetTypeSelect />,
  ],
  [
    SidePanelPages.PageLayoutGraphTypeSelect,
    <CommandMenuPageLayoutChartSettings />,
  ],
  [
    SidePanelPages.PageLayoutGraphFilter,
    <CommandMenuPageLayoutGraphFilter />,
  ],
  [
    SidePanelPages.PageLayoutIframeSettings,
    <CommandMenuPageLayoutIframeSettings />,
  ],
  [
    SidePanelPages.PageLayoutTabSettings,
    <CommandMenuPageLayoutTabSettings />,
  ],
  [
    SidePanelPages.PageLayoutFieldsSettings,
    <CommandMenuPageLayoutFieldsSettings />,
  ],
  [
    SidePanelPages.PageLayoutFieldsLayout,
    <CommandMenuPageLayoutFieldsLayout />,
  ],
  [SidePanelPages.ViewFrontComponent, <SidePanelFrontComponentPage />],
  [
    SidePanelPages.NavigationMenuItemEdit,
    <SidePanelNavigationMenuItemEditPage />,
  ],
  [SidePanelPages.NavigationMenuAddItem, <SidePanelNewSidebarItemPage />],
]);
