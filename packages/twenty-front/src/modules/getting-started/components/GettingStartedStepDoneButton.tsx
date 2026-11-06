import { GettingStartedChatThreadDoneButton } from '@/getting-started/components/GettingStartedChatThreadDoneButton';
import { GettingStartedInviteDoneButton } from '@/getting-started/components/GettingStartedInviteDoneButton';
import { GettingStartedWorkflowDoneButton } from '@/getting-started/components/GettingStartedWorkflowDoneButton';
import { type GettingStartedStepDoneCta } from '@/getting-started/types/GettingStartedStepDoneCta';
import { assertUnreachable } from 'twenty-shared/utils';

type GettingStartedStepDoneButtonProps = {
  doneCta: GettingStartedStepDoneCta;
};

export const GettingStartedStepDoneButton = ({
  doneCta,
}: GettingStartedStepDoneButtonProps) => {
  switch (doneCta.type) {
    case 'chatThread':
      return (
        <GettingStartedChatThreadDoneButton
          chatThreadId={doneCta.chatThreadId}
        />
      );
    case 'workflow':
      return (
        <GettingStartedWorkflowDoneButton
          stepActionKey={doneCta.stepActionKey}
        />
      );
    case 'invite':
      return <GettingStartedInviteDoneButton />;
    default:
      return assertUnreachable(doneCta);
  }
};
