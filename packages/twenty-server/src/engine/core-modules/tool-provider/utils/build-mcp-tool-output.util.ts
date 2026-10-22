import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { type McpToolCallResult } from 'src/engine/metadata-modules/mcp-server/types/mcp-tool-call-result.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const describeContentBlock = (
  block: McpToolCallResult['content'][number],
): string | undefined => {
  switch (block.type) {
    case 'text':
      return block.text;
    case 'image':
    case 'audio':
      return `[${block.type}: ${block.mimeType}]`;
    case 'resource':
      return 'text' in block.resource
        ? block.resource.text
        : `[resource: ${block.resource.uri}]`;
    case 'resource_link':
      return `[resource link: ${block.uri}]`;
    default:
      return undefined;
  }
};

export const buildMcpToolOutput = ({
  toolName,
  result,
}: {
  toolName: string;
  result: McpToolCallResult;
}): ToolOutput => {
  const texts = result.content.map(describeContentBlock).filter(isDefined);
  const text = texts.join('\n');

  if (result.isError) {
    return {
      success: false,
      message: `${toolName} failed`,
      error: isNonEmptyString(text) ? text : 'The MCP server reported an error',
    };
  }

  return {
    success: true,
    message: `${toolName} returned ${texts.length} content block${texts.length === 1 ? '' : 's'}`,
    result: isDefined(result.structuredContent)
      ? result.structuredContent
      : { text },
  };
};
