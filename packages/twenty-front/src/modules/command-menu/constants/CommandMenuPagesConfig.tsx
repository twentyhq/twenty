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
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  CommandMenuPages,
  React.ReactNode
>([
  [CommandMenuPages.Root, <CommandMenu />],
  [CommandMenuPages.ViewRecord, <CommandMenuRecordPage />],
  [CommandMenuPages.MergeRecords, <CommandMenuMergeRecordPage />],
  [CommandMenuPages.UpdateRecords, <CommandMenuUpdateMultipleRecords />],
  [CommandMenuPages.ViewEmailThread, <CommandMenuMessageThreadPage />],
  [CommandMenuPages.ViewCalendarEvent, <CommandMenuCalendarEventPage />],
  [CommandMenuPages.EditRichText, <CommandMenuEditRichTextPage />],
  [
    CommandMenuPages.WorkflowTriggerSelectType,
    <CommandMenuWorkflowSelectTriggerType />,
  ],
  [CommandMenuPages.WorkflowStepCreate, <CommandMenuWorkflowCreateStep />],
  [CommandMenuPages.WorkflowStepEditType, <CommandMenuWorkflowEditStepType />],
  [CommandMenuPages.WorkflowStepEdit, <CommandMenuWorkflowEditStep />],
  [CommandMenuPages.WorkflowStepView, <CommandMenuWorkflowViewStep />],
  [CommandMenuPages.WorkflowRunStepView, <CommandMenuWorkflowRunViewStep />],
  [CommandMenuPages.SearchRecords, <CommandMenuSearchRecordsPage />],
  [CommandMenuPages.AskAI, <CommandMenuAskAIPage />],
  [CommandMenuPages.ViewPreviousAIChats, <CommandMenuAIChatThreadsPage />],
  [
    CommandMenuPages.PageLayoutWidgetTypeSelect,
    <CommandMenuPageLayoutWidgetTypeSelect />,
  ],
  [
    CommandMenuPages.PageLayoutGraphTypeSelect,
    <CommandMenuPageLayoutChartSettings />,
  ],
  [
    CommandMenuPages.PageLayoutGraphFilter,
    <CommandMenuPageLayoutGraphFilter />,
  ],
  [
    CommandMenuPages.PageLayoutIframeSettings,
    <CommandMenuPageLayoutIframeSettings />,
  ],
  [
    CommandMenuPages.PageLayoutTabSettings,
    <CommandMenuPageLayoutTabSettings />,
  ],
  [
    CommandMenuPages.PageLayoutFieldsSettings,
    <CommandMenuPageLayoutFieldsSettings />,
  ],
  [
    CommandMenuPages.PageLayoutFieldsLayout,
    <CommandMenuPageLayoutFieldsLayout />,
  ],
  [CommandMenuPages.ViewFrontComponent, <CommandMenuFrontComponentPage />],
  [
    CommandMenuPages.NavigationMenuItemEdit,
    <CommandMenuNavigationMenuItemEditPage />,
  ],
  [CommandMenuPages.NavigationMenuAddItem, <CommandMenuNewSidebarItemPage />],
]);
