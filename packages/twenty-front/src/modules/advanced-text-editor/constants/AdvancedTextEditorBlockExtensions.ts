import { ButtonNode } from '@/advanced-text-editor/extensions/blocks/ButtonNode';
import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { DividerNode } from '@/advanced-text-editor/extensions/blocks/DividerNode';
import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { type AnyExtension } from '@tiptap/core';

export const ADVANCED_TEXT_EDITOR_BLOCK_EXTENSIONS: AnyExtension[] = [
  SectionNode,
  ColumnsNode,
  ColumnNode,
  ButtonNode,
  DividerNode,
  HtmlNode,
];
