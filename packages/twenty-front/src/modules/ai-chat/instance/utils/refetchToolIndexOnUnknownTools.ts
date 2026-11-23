import { type ApolloClient } from '@apollo/client';
import { isToolUIPart } from 'ai';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';
import { invalidateToolIndex } from '@/ai/utils/invalidateToolIndex';
import { GetToolIndexDocument } from '~/generated-metadata/graphql';

const requestedUnknownToolNamesByClient = new WeakMap<
  ApolloClient,
  Set<string>
>();

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

  const requestedUnknownToolNames =
    requestedUnknownToolNamesByClient.get(apolloClient) ?? new Set<string>();

  requestedUnknownToolNamesByClient.set(
    apolloClient,
    requestedUnknownToolNames,
  );

  const knownToolNames = new Set(toolIndex.map(({ name }) => name));
  const unknownToolNames = [
    ...new Set(
      messages
        .flatMap(({ parts }) => parts)
        .filter(isToolUIPart)
        .map(getEffectiveToolName),
    ),
  ].filter(
    (toolName) =>
      !knownToolNames.has(toolName) && !requestedUnknownToolNames.has(toolName),
  );

  if (!isNonEmptyArray(unknownToolNames)) {
    return;
  }

  unknownToolNames.forEach((toolName) =>
    requestedUnknownToolNames.add(toolName),
  );

  invalidateToolIndex(apolloClient).catch(() =>
    unknownToolNames.forEach((toolName) =>
      requestedUnknownToolNames.delete(toolName),
    ),
  );
};
