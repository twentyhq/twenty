import { CampaignVariableTag } from '@/advanced-text-editor/extensions/campaign-variables/CampaignVariableTag';
import { EmailButton } from '@/advanced-text-editor/extensions/email-blocks/EmailButton';
import { EmailHtml } from '@/advanced-text-editor/extensions/email-blocks/EmailHtml';
import { EmailColumn } from '@/advanced-text-editor/extensions/email-blocks/EmailColumn';
import { EmailColumns } from '@/advanced-text-editor/extensions/email-blocks/EmailColumns';
import { EmailDivider } from '@/advanced-text-editor/extensions/email-blocks/EmailDivider';
import { EmailSection } from '@/advanced-text-editor/extensions/email-blocks/EmailSection';
import { ResizableImage } from '@/advanced-text-editor/extensions/resizable-image/ResizableImage';
import { UploadImageExtension } from '@/advanced-text-editor/extensions/resizable-image/UploadImageExtension';
import { SlashCommand } from '@/advanced-text-editor/extensions/slash-command/SlashCommand';
import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';
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
  onImageUpload?: (file: File) => Promise<string>;
  onImageUploadError?: (error: Error, file: File) => void;
};

type AdvancedTextEditorExtensionFactory = (
  context: AdvancedTextEditorExtensionContext,
) => AnyExtension[];

// Entries are factories rather than extension arrays because some extensions
// need runtime context (image upload callbacks). Adding a capability to
// AdvancedTextEditorCapability without registering it here is a compile error.
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
  emailBlocks: () => [
    EmailSection,
    EmailColumns,
    EmailColumn,
    EmailButton,
    EmailDivider,
    EmailHtml,
  ],
};
