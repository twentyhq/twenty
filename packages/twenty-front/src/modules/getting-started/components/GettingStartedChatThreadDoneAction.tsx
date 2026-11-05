import { GettingStartedChatThreadDoneCard } from '@/getting-started/components/GettingStartedChatThreadDoneCard';
import { isDefined } from 'twenty-shared/utils';
import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

type GettingStartedChatThreadDoneActionProps = {
  stepDefinition: Pick<
    GettingStartedStepDefinition,
    'doneChatThreadId' | 'title'
  >;
};

export const GettingStartedChatThreadDoneAction = ({
  stepDefinition: { doneChatThreadId, title },
}: GettingStartedChatThreadDoneActionProps) =>
  isDefined(doneChatThreadId) ? (
    <GettingStartedChatThreadDoneCard
      chatThreadId={doneChatThreadId}
      fallbackTitle={title}
    />
  ) : null;
