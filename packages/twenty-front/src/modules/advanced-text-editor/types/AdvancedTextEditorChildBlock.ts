import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

export type AdvancedTextEditorChildBlock = {
  node: ProseMirrorNode;
  pos: number;
  index: number;
  element: HTMLElement;
  rect: DOMRect;
};
