import { RightDrawerAIChat } from '@/activities/copilot/right-drawer/components/RightDrawerAIChat';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuCalendarEventPage } from '@/command-menu/pages/calendar-event/components/CommandMenuCalendarEventPage';
import { CommandMenuSearchRecordsPage } from '@/command-menu/pages/components/CommandMenuSearchRecordsPage';
import { CommandMenuMessageThreadPage } from '@/command-menu/pages/message-thread/components/CommandMenuMessageThreadPage';
import { CommandMenuRecordPage } from '@/command-menu/pages/record-page/components/CommandMenuRecordPage';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { RightDrawerWorkflowEditStep } from '@/workflow/workflow-steps/components/RightDrawerWorkflowEditStep';
import { RightDrawerWorkflowRunViewStep } from '@/workflow/workflow-steps/components/RightDrawerWorkflowRunViewStep';
import { RightDrawerWorkflowViewStep } from '@/workflow/workflow-steps/components/RightDrawerWorkflowViewStep';
import { RightDrawerWorkflowSelectAction } from '@/workflow/workflow-steps/workflow-actions/components/RightDrawerWorkflowSelectAction';
import { RightDrawerWorkflowSelectTriggerType } from '@/workflow/workflow-trigger/components/RightDrawerWorkflowSelectTriggerType';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  CommandMenuPages,
  React.ReactNode
>([
  [CommandMenuPages.Root, <CommandMenu />],
  [CommandMenuPages.ViewRecord, <CommandMenuRecordPage />],
  [CommandMenuPages.ViewEmailThread, <CommandMenuMessageThreadPage />],
  [CommandMenuPages.ViewCalendarEvent, <CommandMenuCalendarEventPage />],
  [CommandMenuPages.Copilot, <RightDrawerAIChat />],
  [
    CommandMenuPages.WorkflowStepSelectTriggerType,
    <RightDrawerWorkflowSelectTriggerType />,
  ],
  [
    CommandMenuPages.WorkflowStepSelectAction,
    <RightDrawerWorkflowSelectAction />,
  ],
  [CommandMenuPages.WorkflowStepEdit, <RightDrawerWorkflowEditStep />],
  [CommandMenuPages.WorkflowStepView, <RightDrawerWorkflowViewStep />],
  [CommandMenuPages.WorkflowRunStepView, <RightDrawerWorkflowRunViewStep />],
  [CommandMenuPages.SearchRecords, <CommandMenuSearchRecordsPage />],
]);
