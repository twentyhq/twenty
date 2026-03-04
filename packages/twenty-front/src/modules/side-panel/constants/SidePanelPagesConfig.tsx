import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { SidePanelAIChatThreadsPage } from '@/command-menu/pages/AIChatThreads/components/SidePanelAIChatThreadsPage';
import { SidePanelAskAIPage } from '@/command-menu/pages/ask-ai/components/SidePanelAskAIPage';
import { SidePanelCalendarEventPage } from '@/command-menu/pages/calendar-event/components/SidePanelCalendarEventPage';
import { SidePanelFrontComponentPage } from '@/command-menu/pages/front-component/components/SidePanelFrontComponentPage';
import { SidePanelMessageThreadPage } from '@/command-menu/pages/message-thread/components/SidePanelMessageThreadPage';
import { SidePanelNavigationMenuItemEditPage } from '@/command-menu/pages/navigation-menu-item/components/SidePanelNavigationMenuItemEditPage';
import { SidePanelNewSidebarItemPage } from '@/command-menu/pages/navigation-menu-item/components/SidePanelNewSidebarItemPage';
import { CommandMenuPageLayoutChartSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutChartSettings';
import { CommandMenuPageLayoutFieldsLayout } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutFieldsLayout';
import { CommandMenuPageLayoutFieldsSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutFieldsSettings';
import { CommandMenuPageLayoutGraphFilter } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutGraphFilter';
import { CommandMenuPageLayoutIframeSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutIframeSettings';
import { CommandMenuPageLayoutTabSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutTabSettings';
import { CommandMenuPageLayoutWidgetTypeSelect } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutWidgetTypeSelect';
import { SidePanelMergeRecordPage } from '@/command-menu/pages/record-page/components/SidePanelMergeRecordPage';
import { SidePanelRecordPage } from '@/command-menu/pages/record-page/components/SidePanelRecordPage';
import { CommandMenuUpdateMultipleRecords } from '@/command-menu/pages/record-page/components/CommandMenuUpdateMultipleRecords';
import { SidePanelEditRichTextPage } from '@/command-menu/pages/rich-text-page/components/SidePanelEditRichTextPage';
import { SidePanelSearchRecordsPage } from '@/command-menu/pages/search/components/SidePanelSearchRecordsPage';
import { CommandMenuWorkflowCreateStep } from '@/command-menu/pages/workflow/step/create/components/CommandMenuWorkflowCreateStep';
import { CommandMenuWorkflowEditStep } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStep';
import { CommandMenuWorkflowEditStepType } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepType';
import { CommandMenuWorkflowRunViewStep } from '@/command-menu/pages/workflow/step/view-run/components/CommandMenuWorkflowRunViewStep';
import { CommandMenuWorkflowViewStep } from '@/command-menu/pages/workflow/step/view/components/CommandMenuWorkflowViewStep';
import { CommandMenuWorkflowSelectTriggerType } from '@/command-menu/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerType';
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
