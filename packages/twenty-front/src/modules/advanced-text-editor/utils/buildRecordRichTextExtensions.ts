import { Blockquote } from '@/advanced-text-editor/extensions/blockquote/Blockquote';
import { RichTextDividerNode } from '@/advanced-text-editor/extensions/blocks/RichTextDividerNode';
import { EmptyBlockHint } from '@/advanced-text-editor/extensions/empty-block-hint/EmptyBlockHint';
import { FileNode } from '@/advanced-text-editor/extensions/file/FileNode';
import { Indent } from '@/advanced-text-editor/extensions/indent/Indent';
import { ResizableImage } from '@/advanced-text-editor/extensions/resizable-image/ResizableImage';
import { RichTextColor } from '@/advanced-text-editor/extensions/rich-text-color/RichTextColor';
import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { ToggleNode } from '@/advanced-text-editor/extensions/toggle/ToggleNode';
import { UploadExtension } from '@/advanced-text-editor/extensions/upload/UploadExtension';
import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { type AnyExtension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Code } from '@tiptap/extension-code';
import { CodeBlock } from '@tiptap/extension-code-block';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListKit } from '@tiptap/extension-list';
import { Strike } from '@tiptap/extension-strike';
import { TableKit } from '@tiptap/extension-table';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import { Underline } from '@tiptap/extension-underline';
import { isStorableRichTextUrl, TIPTAP_NODE_TYPES } from 'twenty-shared/utils';

export const buildRecordRichTextExtensions = ({
  onImageUpload,
  onImageUploadError,
  onFileUpload,
  onFileUploadError,
}: AdvancedTextEditorExtensionContext): AnyExtension[] => [
  Bold,
  Italic,
  Strike,
  Underline,
  Code,
  TextStyle,
  RichTextColor,
  Heading.configure({ levels: [1, 2, 3, 4, 5, 6] }),
  TextAlign.configure({
    types: [TIPTAP_NODE_TYPES.HEADING, TIPTAP_NODE_TYPES.PARAGRAPH],
  }),
  ListKit.configure({ taskItem: { nested: true } }),
  ToggleNode,
  Indent,
  Blockquote,
  CodeBlock,
  TableKit.configure({ table: { resizable: true } }),
  RichTextDividerNode,
  Link.configure({
    openOnClick: false,
    isAllowedUri: isStorableRichTextUrl,
  }),
  ResizableImage,
  UploadExtension.configure({
    onImageUpload,
    onImageUploadError,
    onFileUpload,
    onFileUploadError,
  }),
  FileNode,
  MentionTag,
  SlashCommand,
  EmptyBlockHint,
];
