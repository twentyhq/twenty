import { isBlockSlice } from '@/advanced-text-editor/utils/isBlockSlice';
import { type Node, type Slice } from '@tiptap/pm/model';
import { dropPoint } from '@tiptap/pm/transform';
import { type EditorView } from '@tiptap/pm/view';
import { isDefined } from 'twenty-shared/utils';

type DropCoordinates = {
  left: number;
  top: number;
};

const getHoveredBlockPosition = (doc: Node, inside: number) => {
  if (inside < 0) {
    return null;
  }

  const hoveredNode = doc.nodeAt(inside);

  if (!isDefined(hoveredNode)) {
    return null;
  }

  if (hoveredNode.isInline) {
    const $inside = doc.resolve(inside);

    return $inside.depth > 0 ? $inside.before() : null;
  }

  return hoveredNode.isTextblock || hoveredNode.isLeaf ? inside : null;
};

const getHoveredBlockBoundary = (
  view: EditorView,
  inside: number,
  top: number,
) => {
  const blockPosition = getHoveredBlockPosition(view.state.doc, inside);

  if (!isDefined(blockPosition)) {
    return null;
  }

  const block = view.state.doc.nodeAt(blockPosition);
  const blockElement = view.nodeDOM(blockPosition);

  if (!isDefined(block) || !(blockElement instanceof HTMLElement)) {
    return null;
  }

  const blockRect = blockElement.getBoundingClientRect();

  return top < blockRect.top + blockRect.height / 2
    ? blockPosition
    : blockPosition + block.nodeSize;
};

type GetDropPositionArgs = {
  view: EditorView;
  coordinates: DropCoordinates;
  slice: Slice | undefined;
};

export const getDropPosition = ({
  view,
  coordinates,
  slice,
}: GetDropPositionArgs) => {
  const position = view.posAtCoords(coordinates);

  if (!isDefined(position)) {
    return null;
  }

  if (!isDefined(slice)) {
    return position.pos;
  }

  const target =
    (isBlockSlice(slice)
      ? getHoveredBlockBoundary(view, position.inside, coordinates.top)
      : null) ?? position.pos;

  return dropPoint(view.state.doc, target, slice) ?? target;
};
