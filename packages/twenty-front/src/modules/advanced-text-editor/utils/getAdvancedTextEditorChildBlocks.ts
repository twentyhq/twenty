import { type AdvancedTextEditorBlockContainer } from '@/advanced-text-editor/types/AdvancedTextEditorBlockContainer';
import { type AdvancedTextEditorChildBlock } from '@/advanced-text-editor/types/AdvancedTextEditorChildBlock';
import { type EditorView } from '@tiptap/pm/view';

export const getAdvancedTextEditorChildBlocks = (
  view: EditorView,
  container: AdvancedTextEditorBlockContainer,
) => {
  const childBlocks: AdvancedTextEditorChildBlock[] = [];

  container.node.forEach((node, offset, index) => {
    const pos = container.contentStart + offset;
    const element = view.nodeDOM(pos);

    if (element instanceof HTMLElement) {
      childBlocks.push({
        node,
        pos,
        index,
        element,
        rect: element.getBoundingClientRect(),
      });
    }
  });

  return childBlocks;
};
