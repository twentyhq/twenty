import { isNonEmptyString } from '@sniptt/guards';
import {
  isDefined,
  parseTipTapJsonDocument,
  TIPTAP_NODE_TYPES,
  type TipTapNode,
} from 'twenty-shared/utils';

export type AttachmentInfo = {
  path: string;
  name: string;
};

const readStringAttribute = ({
  node,
  attributeName,
}: {
  node: TipTapNode;
  attributeName: string;
}) => {
  const value = node.attrs?.[attributeName];

  return isNonEmptyString(value) ? value : undefined;
};

const getNodeAttachment = (node: TipTapNode): AttachmentInfo | undefined => {
  switch (node.type) {
    case TIPTAP_NODE_TYPES.IMAGE: {
      const path = readStringAttribute({ node, attributeName: 'src' });

      return isDefined(path)
        ? {
            path,
            name: readStringAttribute({ node, attributeName: 'alt' }) ?? '',
          }
        : undefined;
    }
    case TIPTAP_NODE_TYPES.FILE: {
      const path = readStringAttribute({ node, attributeName: 'url' });

      return isDefined(path)
        ? {
            path,
            name: readStringAttribute({ node, attributeName: 'name' }) ?? '',
          }
        : undefined;
    }
    default:
      return undefined;
  }
};

const collectAttachments = (node: TipTapNode): AttachmentInfo[] => {
  const attachment = getNodeAttachment(node);
  const childAttachments = (node.content ?? []).flatMap(collectAttachments);

  return isDefined(attachment)
    ? [attachment, ...childAttachments]
    : childAttachments;
};

export const getActivityAttachmentPathsAndName = (
  serializedDocument: string,
): AttachmentInfo[] => {
  const document = parseTipTapJsonDocument(serializedDocument);

  return isDefined(document) ? collectAttachments(document) : [];
};
