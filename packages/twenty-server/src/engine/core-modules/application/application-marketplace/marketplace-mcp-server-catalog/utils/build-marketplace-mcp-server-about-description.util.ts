import { isNonEmptyArray } from 'twenty-shared/utils';

import { type MarketplaceMcpServer } from 'src/engine/core-modules/application/application-marketplace/marketplace-mcp-server-catalog/types/marketplace-mcp-server.type';

export const buildMarketplaceMcpServerAboutDescription = ({
  label,
  author,
  url,
  aboutDescription,
  toolNames,
  isReadOnly,
}: Pick<
  MarketplaceMcpServer,
  'label' | 'author' | 'url' | 'aboutDescription' | 'toolNames' | 'isReadOnly'
>): string => {
  const access =
    isReadOnly === true
      ? ' Its tools only read data.'
      : isReadOnly === false
        ? ' Its tools read and write data.'
        : '';

  const paragraphs = [
    aboutDescription ??
      `Add the ${label} MCP server so your agents and workflows can use its tools.`,
    `Tools run on ${author}'s server at ${url}: agents send it the data each call needs.${access}`,
  ];

  if (isNonEmptyArray(toolNames)) {
    paragraphs.push(
      `### Tools (${toolNames.length})`,
      toolNames.map((toolName) => `- \`${toolName}\``).join('\n'),
    );
  }

  return paragraphs.join('\n\n');
};
