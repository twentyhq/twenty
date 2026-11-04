import { GettingStartedOpenChatThreadButton } from '@/getting-started/components/GettingStartedOpenChatThreadButton';
import { type GettingStartedStepDoneActionProps } from '@/getting-started/types/GettingStartedStepDoneActionProps';
import { isDefined } from 'twenty-shared/utils';

type GettingStartedImportDoneActionProps = GettingStartedStepDoneActionProps;

export const GettingStartedImportDoneAction = ({
  doneChatThreadId,
}: GettingStartedImportDoneActionProps) =>
  isDefined(doneChatThreadId) ? (
    <GettingStartedOpenChatThreadButton chatThreadId={doneChatThreadId} />
  ) : null;
