import {
  getToolName,
  isToolUIPart,
  type UIDataTypes,
  type UIMessagePart,
  type UITools,
} from 'ai';

import {
  EXECUTE_TOOL_TOOL_NAME,
  LEARN_TOOLS_TOOL_NAME,
} from 'src/engine/core-modules/tool-provider/tools';

const buildMetaToolGuidance = (toolName: string): string =>
  ` "${toolName}" is not directly callable. Discover its input schema with ` +
  `${LEARN_TOOLS_TOOL_NAME}({ toolNames: ["${toolName}"] }), then run it through ` +
  `${EXECUTE_TOOL_TOOL_NAME}({ toolName: "${toolName}", arguments: { ... } }).`;

export const guideUncallableToolCallsToMetaTool = <
  TPart extends UIMessagePart<UIDataTypes, UITools>,
>(
  parts: TPart[],
  directlyCallableToolNames: Set<string>,
): TPart[] =>
  parts.map((part) => {
    if (!isToolUIPart(part) || part.state !== 'output-error') {
      return part;
    }

    const toolName = getToolName(part);

    if (directlyCallableToolNames.has(toolName)) {
      return part;
    }

    return {
      ...part,
      errorText: `${part.errorText ?? ''}${buildMetaToolGuidance(toolName)}`,
    };
  });
