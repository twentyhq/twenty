import { type ApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import { type DynamicToolUIPart, isToolUIPart, type ToolUIPart } from 'ai';
import {
  type ExtendedUIMessage,
  PROPOSE_TOOL_CALL_TOOL_NAME,
} from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray, isPlainObject } from 'twenty-shared/utils';

import { getEffectiveToolName } from '@/ai-chat/tool-calls/utils/getEffectiveToolName';
import { invalidateToolIndex } from '@/ai/utils/invalidateToolIndex';
import { GetToolIndexDocument } from '~/generated-metadata/graphql';

const requestedUnknownToolNamesByClient = new WeakMap<
  ApolloClient,
  Set<string>
>();

const getReferencedToolNames = (
  toolPart: ToolUIPart | DynamicToolUIPart,
): string[] => {
  const toolName = getEffectiveToolName(toolPart);

  if (
    toolName === PROPOSE_TOOL_CALL_TOOL_NAME &&
    toolPart.state !== 'input-streaming' &&
    isPlainObject(toolPart.input) &&
    isNonEmptyString(toolPart.input.toolName)
  ) {
    return [toolName, toolPart.input.toolName];
  }

  return [toolName];
};

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
        .flatMap(getReferencedToolNames),
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
