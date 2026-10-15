import { type Node } from '@tiptap/pm/model';
import { TextSelection } from '@tiptap/pm/state';
import { isDefined } from 'twenty-shared/utils';

type GetTurnIntoSelectionArgs = {
  doc: Node;
  blockPos: number;
};

export const getTurnIntoSelection = ({
  doc,
  blockPos,
}: GetTurnIntoSelectionArgs) => {
  const blockNode = doc.nodeAt(blockPos);
  const blockStart = doc.resolve(blockPos + 1);

  if (!isDefined(blockNode) || blockNode.isTextblock) {
    return TextSelection.near(blockStart);
  }

  return TextSelection.between(
    blockStart,
    doc.resolve(blockPos + blockNode.nodeSize - 1),
  );
};
