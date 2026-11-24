import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { useOpenAskAiThread } from '@/ai-chat/threads/hooks/useOpenAskAiThread';
import { type CoreAgent } from '@/object-core/agents/types/CoreAgent';
import {
  GetAgentRunInsightsDocument,
  GetAgentRunsDocument,
  RunAgentDocument,
  RunAgentMessageRole,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

export const useTestCoreAgent = (
  agent: Pick<CoreAgent, 'universalIdentifier'>,
) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openAskAiThread } = useOpenAskAiThread();

  const [runAgent, { loading }] = useMutation(RunAgentDocument, {
    refetchQueries: [GetAgentRunsDocument, GetAgentRunInsightsDocument],
  });

  const testCoreAgent = async (message: string) => {
    try {
      const { data } = await runAgent({
        variables: {
          input: {
            agentUniversalIdentifier: agent.universalIdentifier,
            input: [{ role: RunAgentMessageRole.user, content: message }],
            // the reply streams into the conversation, so nothing waits on the request
            waitForCompletion: false,
          },
        },
      });

      if (isDefined(data?.runAgent)) {
        openAskAiThread(data.runAgent.threadId);
      }
    } catch (error) {
      logError(error);
      enqueueToast({ status: 'error', children: t`Failed to test agent` });
    }
  };

  return { testCoreAgent, isTestingCoreAgent: loading };
};
