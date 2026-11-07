import { isString } from '@sniptt/guards';
import {
  getTipTapFileUrlAttributeName,
  isDefined,
  parseTipTapJsonDocument,
  type TipTapNode,
} from 'twenty-shared/utils';

const stripUrlToken = (url: unknown): unknown => {
  if (!isString(url) || !URL.canParse(url)) {
    return url;
  }

  const parsedUrl = new URL(url);

  parsedUrl.searchParams.delete('token');

  return parsedUrl.toString();
};

const stripNodeFileUrlTokens = (node: TipTapNode): TipTapNode => {
  const strippedNode: TipTapNode = { ...node };
  const fileUrlAttributeName = getTipTapFileUrlAttributeName(node.type);

  if (isDefined(fileUrlAttributeName) && isDefined(node.attrs)) {
    strippedNode.attrs = {
      ...node.attrs,
      [fileUrlAttributeName]: stripUrlToken(node.attrs[fileUrlAttributeName]),
    };
  }

  if (isDefined(node.content)) {
    strippedNode.content = node.content.map(stripNodeFileUrlTokens);
  }

  return strippedNode;
};

export const stripRichTextFileUrlTokens = (
  serializedDocument: string,
): string => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return isDefined(document)
    ? JSON.stringify(stripNodeFileUrlTokens(document))
    : serializedDocument;
};
