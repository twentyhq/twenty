import { RightDrawerCalendarEvent } from '@/activities/calendar/right-drawer/components/RightDrawerCalendarEvent';
import { RightDrawerAIChat } from '@/activities/copilot/right-drawer/components/RightDrawerAIChat';
import { RightDrawerEmailThread } from '@/activities/emails/right-drawer/components/RightDrawerEmailThread';
import { CommandMenu } from '@/command-menu/components/CommandMenu';
import { CommandMenuPages } from '@/command-menu/components/CommandMenuPages';
import { RightDrawerRecord } from '@/object-record/record-right-drawer/components/RightDrawerRecord';
import { RightDrawerWorkflowEditStep } from '@/workflow/workflow-steps/components/RightDrawerWorkflowEditStep';
import { RightDrawerWorkflowViewStep } from '@/workflow/workflow-steps/components/RightDrawerWorkflowViewStep';
import { RightDrawerWorkflowSelectAction } from '@/workflow/workflow-steps/workflow-actions/components/RightDrawerWorkflowSelectAction';
import { RightDrawerWorkflowSelectTriggerType } from '@/workflow/workflow-trigger/components/RightDrawerWorkflowSelectTriggerType';

export const COMMAND_MENU_PAGES_CONFIG = new Map<
  CommandMenuPages,
  React.ReactNode
>([
  [CommandMenuPages.Root, <CommandMenu />],
  [CommandMenuPages.ViewRecord, <RightDrawerRecord />],
  [CommandMenuPages.ViewEmailThread, <RightDrawerEmailThread />],
  [CommandMenuPages.ViewCalendarEvent, <RightDrawerCalendarEvent />],
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
]);
