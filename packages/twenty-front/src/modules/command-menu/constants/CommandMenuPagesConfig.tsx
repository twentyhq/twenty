import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuAIChatThreadsPage } from '@/command-menu/pages/AIChatThreads/components/CommandMenuAIChatThreadsPage';
import { CommandMenuAskAIPage } from '@/command-menu/pages/ask-ai/components/CommandMenuAskAIPage';
import { CommandMenuCalendarEventPage } from '@/command-menu/pages/calendar-event/components/CommandMenuCalendarEventPage';
import { CommandMenuFrontComponentPage } from '@/command-menu/pages/front-component/components/CommandMenuFrontComponentPage';
import { CommandMenuMessageThreadPage } from '@/command-menu/pages/message-thread/components/CommandMenuMessageThreadPage';
import { CommandMenuNavigationMenuItemEditPage } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNavigationMenuItemEditPage';
import { CommandMenuNewSidebarItemPage } from '@/command-menu/pages/navigation-menu-item/components/CommandMenuNewSidebarItemPage';
import { CommandMenuPageLayoutChartSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutChartSettings';
import { CommandMenuPageLayoutFieldsLayout } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutFieldsLayout';
import { CommandMenuPageLayoutFieldsSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutFieldsSettings';
import { CommandMenuPageLayoutGraphFilter } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutGraphFilter';
import { CommandMenuPageLayoutIframeSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutIframeSettings';
import { CommandMenuPageLayoutTabSettings } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutTabSettings';
import { CommandMenuPageLayoutWidgetTypeSelect } from '@/command-menu/pages/page-layout/components/CommandMenuPageLayoutWidgetTypeSelect';
import { CommandMenuMergeRecordPage } from '@/command-menu/pages/record-page/components/CommandMenuMergeRecordPage';
import { CommandMenuRecordPage } from '@/command-menu/pages/record-page/components/CommandMenuRecordPage';
import { CommandMenuUpdateMultipleRecords } from '@/command-menu/pages/record-page/components/CommandMenuUpdateMultipleRecords';
import { CommandMenuEditRichTextPage } from '@/command-menu/pages/rich-text-page/components/CommandMenuEditRichTextPage';
import { CommandMenuSearchRecordsPage } from '@/command-menu/pages/search/components/CommandMenuSearchRecordsPage';
import { CommandMenuWorkflowCreateStep } from '@/command-menu/pages/workflow/step/create/components/CommandMenuWorkflowCreateStep';
import { CommandMenuWorkflowEditStep } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStep';
import { CommandMenuWorkflowEditStepType } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStepType';
import { CommandMenuWorkflowRunViewStep } from '@/command-menu/pages/workflow/step/view-run/components/CommandMenuWorkflowRunViewStep';
import { CommandMenuWorkflowViewStep } from '@/command-menu/pages/workflow/step/view/components/CommandMenuWorkflowViewStep';
import { CommandMenuWorkflowSelectTriggerType } from '@/command-menu/pages/workflow/trigger-type/components/CommandMenuWorkflowSelectTriggerType';
import { SidePanelPages } from 'twenty-shared/types';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  SidePanelPages,
  React.ReactNode
>([
  [SidePanelPages.Root, <CommandMenu />],
  [SidePanelPages.ViewRecord, <CommandMenuRecordPage />],
  [SidePanelPages.MergeRecords, <CommandMenuMergeRecordPage />],
  [SidePanelPages.UpdateRecords, <CommandMenuUpdateMultipleRecords />],
  [SidePanelPages.ViewEmailThread, <CommandMenuMessageThreadPage />],
  [SidePanelPages.ViewCalendarEvent, <CommandMenuCalendarEventPage />],
  [SidePanelPages.EditRichText, <CommandMenuEditRichTextPage />],
  [
    SidePanelPages.WorkflowTriggerSelectType,
    <CommandMenuWorkflowSelectTriggerType />,
  ],
  [SidePanelPages.WorkflowStepCreate, <CommandMenuWorkflowCreateStep />],
  [SidePanelPages.WorkflowStepEditType, <CommandMenuWorkflowEditStepType />],
  [SidePanelPages.WorkflowStepEdit, <CommandMenuWorkflowEditStep />],
  [SidePanelPages.WorkflowStepView, <CommandMenuWorkflowViewStep />],
  [SidePanelPages.WorkflowRunStepView, <CommandMenuWorkflowRunViewStep />],
  [SidePanelPages.SearchRecords, <CommandMenuSearchRecordsPage />],
  [SidePanelPages.AskAI, <CommandMenuAskAIPage />],
  [SidePanelPages.ViewPreviousAIChats, <CommandMenuAIChatThreadsPage />],
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
  [SidePanelPages.ViewFrontComponent, <CommandMenuFrontComponentPage />],
  [
    SidePanelPages.NavigationMenuItemEdit,
    <CommandMenuNavigationMenuItemEditPage />,
  ],
  [SidePanelPages.NavigationMenuAddItem, <CommandMenuNewSidebarItemPage />],
]);
