import { EmailOperation } from 'twenty-shared/types';
import {
  canConnectedAccountPerformEmailOperation,
  isDefined,
} from 'twenty-shared/utils';

import { type WorkflowConnectedAccountStepType } from 'src/engine/core-modules/application/application-manifest/types/workflow-connected-account-step-type.type';
import { type ConnectedAccountForWorkflowStepResolution } from 'src/engine/metadata-modules/connected-account/types/connected-account-for-workflow-step-resolution.type';
import { canConnectedAccountCreateCalendarEvents } from 'src/modules/calendar/calendar-event-creation-manager/utils/can-connected-account-create-calendar-events.util';

const canConnectedAccountRunStep = ({
  stepType,
  connectedAccount,
}: {
  stepType: WorkflowConnectedAccountStepType;
  connectedAccount: ConnectedAccountForWorkflowStepResolution;
}): boolean => {
  switch (stepType) {
    case 'SEND_EMAIL':
      return canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.SEND,
      });
    case 'DRAFT_EMAIL':
      return canConnectedAccountPerformEmailOperation({
        connectedAccount,
        operation: EmailOperation.DRAFT,
      });
    case 'CREATE_CALENDAR_EVENT':
      return canConnectedAccountCreateCalendarEvents(connectedAccount);
  }
};

// Members can connect the same mailbox, or one address through two providers: the oldest account able to run the step wins
export const findWorkflowStepConnectedAccount = ({
  stepType,
  handle,
  connectedAccounts,
}: {
  stepType: WorkflowConnectedAccountStepType;
  handle: string;
  connectedAccounts: readonly ConnectedAccountForWorkflowStepResolution[];
}): ConnectedAccountForWorkflowStepResolution | undefined =>
  connectedAccounts.find(
    (connectedAccount) =>
      // Sync acts for no member, so a handle can only name an account shared with the workspace
      connectedAccount.scope === 'WORKSPACE' &&
      !isDefined(connectedAccount.archivedAt) &&
      connectedAccount.handle.toLowerCase() === handle.toLowerCase() &&
      canConnectedAccountRunStep({ stepType, connectedAccount }),
  );
