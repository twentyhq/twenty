import { ResizableImage } from '@/advanced-text-editor/extensions/resizable-image/ResizableImage';
import { UploadImageExtension } from '@/advanced-text-editor/extensions/resizable-image/UploadImageExtension';
import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { type AnyExtension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListKit } from '@tiptap/extension-list';
import { Strike } from '@tiptap/extension-strike';
import { Underline } from '@tiptap/extension-underline';

export const buildFullRichTextExtensions = (
  context: AdvancedTextEditorExtensionContext,
): AnyExtension[] => [
  Bold,
  Italic,
  Strike,
  Underline,
  Heading.configure({ levels: [1, 2, 3] }),
  ListKit,
  Link.configure({ openOnClick: false }),
  ResizableImage,
  UploadImageExtension.configure(context),
  SlashCommand,
];
