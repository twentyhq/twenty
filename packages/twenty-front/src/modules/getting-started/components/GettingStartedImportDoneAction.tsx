import { GettingStartedChatThreadDoneCard } from '@/getting-started/components/GettingStartedChatThreadDoneCard';
import { isDefined } from 'twenty-shared/utils';
import { type GettingStartedStepDefinition } from '~/generated-metadata/graphql';

type GettingStartedImportDoneActionProps = {
  stepDefinition: Pick<
    GettingStartedStepDefinition,
    'doneChatThreadId' | 'title'
  >;
};

export const GettingStartedImportDoneAction = ({
  stepDefinition: { doneChatThreadId, title },
}: GettingStartedImportDoneActionProps) =>
  isDefined(doneChatThreadId) ? (
    <GettingStartedChatThreadDoneCard
      chatThreadId={doneChatThreadId}
      fallbackTitle={title}
    />
  ) : null;
