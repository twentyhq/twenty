import { type Node as ProseMirrorNode } from '@tiptap/pm/model';

export type AdvancedTextEditorBlockContainer = {
  node: ProseMirrorNode;
  contentStart: number;
  element: HTMLElement;
};
