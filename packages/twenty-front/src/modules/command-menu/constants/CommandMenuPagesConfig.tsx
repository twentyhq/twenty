import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuCalendarEventPage } from '@/command-menu/pages/calendar-event/components/CommandMenuCalendarEventPage';
import { CommandMenuMessageThreadPage } from '@/command-menu/pages/message-thread/components/CommandMenuMessageThreadPage';
import { CommandMenuRecordPage } from '@/command-menu/pages/record-page/components/CommandMenuRecordPage';
import { CommandMenuEditRichTextPage } from '@/command-menu/pages/rich-text-page/components/CommandMenuEditRichTextPage';
import { CommandMenuSearchRecordsPage } from '@/command-menu/pages/search/components/CommandMenuSearchRecordsPage';
import { CommandMenuWorkflowSelectAction } from '@/command-menu/pages/workflow/action/components/CommandMenuWorkflowSelectAction';
import { CommandMenuWorkflowEditStep } from '@/command-menu/pages/workflow/step/edit/components/CommandMenuWorkflowEditStep';
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
  [CommandMenuPages.ViewEmailThread, <CommandMenuMessageThreadPage />],
  [CommandMenuPages.ViewCalendarEvent, <CommandMenuCalendarEventPage />],
  [CommandMenuPages.EditRichText, <CommandMenuEditRichTextPage />],
  [
    CommandMenuPages.WorkflowStepSelectTriggerType,
    <CommandMenuWorkflowSelectTriggerType />,
  ],
  [
    CommandMenuPages.WorkflowStepSelectAction,
    <CommandMenuWorkflowSelectAction />,
  ],
  [CommandMenuPages.WorkflowStepEdit, <CommandMenuWorkflowEditStep />],
  [CommandMenuPages.WorkflowStepView, <CommandMenuWorkflowViewStep />],
  [CommandMenuPages.WorkflowRunStepView, <CommandMenuWorkflowRunViewStep />],
  [CommandMenuPages.SearchRecords, <CommandMenuSearchRecordsPage />],
]);
