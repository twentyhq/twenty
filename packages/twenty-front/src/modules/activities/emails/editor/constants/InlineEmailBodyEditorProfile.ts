import { HtmlDocumentNode } from '@/advanced-text-editor/extensions/blocks/HtmlDocumentNode';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildFullRichTextWithVariableTagExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';

export const INLINE_EMAIL_BODY_EDITOR_PROFILE = {
  chrome: 'document',
  variant: 'email',
  minHeight: 120,
  enableFullScreen: true,
  buildExtensions: (context) => [
    ...buildFullRichTextWithVariableTagExtensions(context),
    HtmlDocumentNode.configure({ isInlineEditable: true }),
  ],
} satisfies AdvancedTextEditorProfile;
