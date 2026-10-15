import { type Node as ProseMirrorNode } from '@tiptap/pm/model';
import { type Transaction } from '@tiptap/pm/state';
import { ReplaceStep } from '@tiptap/pm/transform';
import { isDefined } from 'twenty-shared/utils';

const HISTORY_PLUGIN_META_KEY = 'history$';

const countNodesOfType = (doc: ProseMirrorNode, nodeTypeName: string) => {
  let count = 0;

  doc.descendants((node) => {
    if (node.type.name === nodeTypeName) {
      count++;
    }
  });

  return count;
};

const stepInsertsNodeOfType = (
  step: Transaction['steps'][number],
  nodeTypeName: string,
) => {
  if (!(step instanceof ReplaceStep)) {
    return false;
  }

  let insertsNode = false;

  step.slice.content.descendants((node) => {
    insertsNode ||= node.type.name === nodeTypeName;

    return !insertsNode;
  });

  return insertsNode;
};

type GetInsertedNodePositionArgs = {
  transaction: Transaction;
  nodeTypeName: string;
};

export const getInsertedNodePosition = ({
  transaction,
  nodeTypeName,
}: GetInsertedNodePositionArgs) => {
  if (
    !transaction.docChanged ||
    isDefined(transaction.getMeta(HISTORY_PLUGIN_META_KEY)) ||
    !transaction.steps.some((step) =>
      stepInsertsNodeOfType(step, nodeTypeName),
    ) ||
    countNodesOfType(transaction.doc, nodeTypeName) <=
      countNodesOfType(transaction.before, nodeTypeName)
  ) {
    return null;
  }

  const invertedMapping = transaction.mapping.invert();
  let insertedPosition: number | null = null;

  transaction.doc.descendants((node, position) => {
    if (
      node.type.name === nodeTypeName &&
      invertedMapping.mapResult(position, 1).deletedAfter
    ) {
      insertedPosition = position;
    }
  });

  return insertedPosition;
};
