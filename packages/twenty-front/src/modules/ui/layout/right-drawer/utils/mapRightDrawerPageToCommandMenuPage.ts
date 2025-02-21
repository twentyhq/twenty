import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { RightDrawerPages } from '@/ui/layout/right-drawer/types/RightDrawerPages';

export const mapRightDrawerPageToCommandMenuPage = (
  rightDrawerPage: RightDrawerPages,
) => {
  const rightDrawerPagesToCommandMenuPages: Record<
    RightDrawerPages,
    CommandMenuPages
  > = {
    [RightDrawerPages.ViewRecord]: CommandMenuPages.ViewRecord,
    [RightDrawerPages.ViewEmailThread]: CommandMenuPages.ViewEmailThread,
    [RightDrawerPages.ViewCalendarEvent]: CommandMenuPages.ViewCalendarEvent,
    [RightDrawerPages.Copilot]: CommandMenuPages.Copilot,
    [RightDrawerPages.WorkflowStepSelectTriggerType]:
      CommandMenuPages.WorkflowStepSelectTriggerType,
    [RightDrawerPages.WorkflowStepSelectAction]:
      CommandMenuPages.WorkflowStepSelectAction,
    [RightDrawerPages.WorkflowStepView]: CommandMenuPages.WorkflowStepView,
    [RightDrawerPages.WorkflowRunStepView]:
      CommandMenuPages.WorkflowRunStepView,
    [RightDrawerPages.WorkflowStepEdit]: CommandMenuPages.WorkflowStepEdit,
  };

  return (
    rightDrawerPagesToCommandMenuPages[rightDrawerPage] ?? CommandMenuPages.Root
  );
};
