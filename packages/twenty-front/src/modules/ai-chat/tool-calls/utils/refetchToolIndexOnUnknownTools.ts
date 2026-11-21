import { type ApolloClient } from '@apollo/client';
import { isToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';
import { GetToolIndexDocument } from '~/generated-metadata/graphql';

// Tools the index still lacks after a refetch (built-ins outside it) must not refetch again
const requestedUnknownToolNames = new Set<string>();

export const refetchToolIndexOnUnknownTools = ({
  apolloClient,
  messages,
}: {
  apolloClient: ApolloClient;
  messages: ExtendedUIMessage[];
}) => {
  const toolIndex = apolloClient.readQuery({
    query: GetToolIndexDocument,
  })?.getToolIndex;

  if (!isDefined(toolIndex)) {
    return;
  }

  const knownToolNames = new Set(toolIndex.map(({ name }) => name));
  const unknownToolNames = messages
    .flatMap(({ parts }) => parts)
    .filter(isToolUIPart)
    .map(getEffectiveToolName)
    .filter(
      (toolName) =>
        !knownToolNames.has(toolName) &&
        !requestedUnknownToolNames.has(toolName),
    );

  if (!isNonEmptyArray(unknownToolNames)) {
    return;
  }

  unknownToolNames.forEach((toolName) =>
    requestedUnknownToolNames.add(toolName),
  );

  apolloClient
    .refetchQueries({
      updateCache: (cache) => {
        cache.evict({ id: 'ROOT_QUERY', fieldName: 'getToolIndex' });
      },
    })
    .catch(() => undefined);
};
