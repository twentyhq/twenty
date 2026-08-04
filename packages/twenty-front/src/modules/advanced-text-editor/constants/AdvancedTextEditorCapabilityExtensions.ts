import { CampaignVariableTag } from '@/advanced-text-editor/extensions/campaign-variables/CampaignVariableTag';
import { ButtonNode } from '@/advanced-text-editor/extensions/blocks/ButtonNode';
import { HtmlNode } from '@/advanced-text-editor/extensions/blocks/HtmlNode';
import { ColumnNode } from '@/advanced-text-editor/extensions/blocks/ColumnNode';
import { ColumnsNode } from '@/advanced-text-editor/extensions/blocks/ColumnsNode';
import { DividerNode } from '@/advanced-text-editor/extensions/blocks/DividerNode';
import { SectionNode } from '@/advanced-text-editor/extensions/blocks/SectionNode';
import { ResizableImage } from '@/advanced-text-editor/extensions/resizable-image/ResizableImage';
import { UploadImageExtension } from '@/advanced-text-editor/extensions/resizable-image/UploadImageExtension';
import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';
import { type UploadedImage } from '@/advanced-text-editor/types/UploadedImage';
import { MentionSuggestion } from '@/mention/extensions/MentionSuggestion';
import { MentionTag } from '@/mention/extensions/MentionTag';
import { VariableTag } from '@/workflow/workflow-variables/utils/variableTag';
import { type AnyExtension } from '@tiptap/core';
import { Bold } from '@tiptap/extension-bold';
import { Heading } from '@tiptap/extension-heading';
import { Italic } from '@tiptap/extension-italic';
import { Link } from '@tiptap/extension-link';
import { ListKit } from '@tiptap/extension-list';
import { Strike } from '@tiptap/extension-strike';
import { Underline } from '@tiptap/extension-underline';

export type AdvancedTextEditorExtensionContext = {
  onImageUpload?: (file: File) => Promise<UploadedImage>;
  onImageUploadError?: (error: Error, file: File) => void;
};

type AdvancedTextEditorExtensionFactory = (
  context: AdvancedTextEditorExtensionContext,
) => AnyExtension[];

export const ADVANCED_TEXT_EDITOR_CAPABILITY_EXTENSIONS: Record<
  AdvancedTextEditorCapability,
  AdvancedTextEditorExtensionFactory
> = {
  basicMarks: () => [Bold, Italic, Strike, Underline],
  headings: () => [
    Heading.configure({
      levels: [1, 2, 3],
    }),
  ],
  lists: () => [ListKit],
  links: () => [
    Link.configure({
      openOnClick: false,
    }),
  ],
  images: ({ onImageUpload, onImageUploadError }) => [
    ResizableImage,
    UploadImageExtension.configure({
      onImageUpload,
      onImageUploadError,
    }),
  ],
  variables: () => [VariableTag],
  campaignVariables: () => [CampaignVariableTag],
  mentions: () => [MentionTag, MentionSuggestion],
  slashCommand: () => [SlashCommand],
  blocks: () => [
    SectionNode,
    ColumnsNode,
    ColumnNode,
    ButtonNode,
    DividerNode,
    HtmlNode,
  ],
};
