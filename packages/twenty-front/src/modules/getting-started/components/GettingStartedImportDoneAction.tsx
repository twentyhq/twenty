import { GettingStartedChatThreadDoneCard } from '@/getting-started/components/GettingStartedChatThreadDoneCard';
import { type GettingStartedStepDoneActionProps } from '@/getting-started/types/GettingStartedStepDoneActionProps';
import { isDefined } from 'twenty-shared/utils';

type GettingStartedImportDoneActionProps = GettingStartedStepDoneActionProps;

export const GettingStartedImportDoneAction = ({
  stepDefinition: { doneChatThreadId, title },
}: GettingStartedImportDoneActionProps) =>
  isDefined(doneChatThreadId) ? (
    <GettingStartedChatThreadDoneCard
      chatThreadId={doneChatThreadId}
      fallbackTitle={title}
    />
  ) : null;
