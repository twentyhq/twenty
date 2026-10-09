import { isNonEmptyString } from '@sniptt/guards';

import { CliError } from '@/output/cli-error';
import { RESPONSE_BYTE_LIMIT } from '@/transport/constants/response-byte-limit.constant';
import { RESULT_ITEM_LIMIT } from '@/transport/constants/result-item-limit.constant';

type MetadataPage<TNode> = {
  edges: { node: TNode }[];
  pageInfo: { hasNextPage?: boolean; endCursor?: string };
};

export const collectMetadataNodes = async <TNode>(
  fetchPage: (after?: string) => Promise<MetadataPage<TNode>>,
) => {
  const nodes: TNode[] = [];
  const cursors = new Set<string>();
  let after: string | undefined;
  let bytes = 0;
  let hasNextPage = true;

  while (hasNextPage) {
    const page = await fetchPage(after);

    for (const { node } of page.edges) {
      bytes += Buffer.byteLength(JSON.stringify(node), 'utf8');

      if (nodes.length >= RESULT_ITEM_LIMIT || bytes > RESPONSE_BYTE_LIMIT) {
        throw new CliError({
          code: 'RESPONSE_LIMIT_EXCEEDED',
          message:
            'Metadata exceeds the 10,000-item or 16 MiB inspection limit.',
          hint: 'Use api graphql to select and page the metadata you need.',
        });
      }

      nodes.push(node);
    }

    hasNextPage = page.pageInfo.hasNextPage !== false;

    if (hasNextPage) {
      const cursor = page.pageInfo.endCursor;

      if (
        page.pageInfo.hasNextPage !== true ||
        !isNonEmptyString(cursor) ||
        cursors.has(cursor) ||
        page.edges.length === 0
      ) {
        throw new CliError({
          code: 'INVALID_RESPONSE',
          message:
            'The metadata server returned invalid pagination information.',
        });
      }

      cursors.add(cursor);
      after = cursor;
    }
  }

  return nodes;
};
