import {
  ADVANCED_TEXT_EDITOR_CAPABILITY_EXTENSIONS,
  type AdvancedTextEditorExtensionContext,
} from '@/advanced-text-editor/constants/AdvancedTextEditorCapabilityExtensions';
import { buildAdvancedTextEditorCoreExtensions } from '@/advanced-text-editor/constants/AdvancedTextEditorCoreExtensions';
import { EmailThemeDocument } from '@/advanced-text-editor/extensions/email-blocks/EmailThemeDocument';
import { type AdvancedTextEditorCapability } from '@/advanced-text-editor/types/AdvancedTextEditorCapability';
import { type AnyExtension } from '@tiptap/core';

export const buildAdvancedTextEditorExtensions = ({
  capabilities,
  context,
  placeholder,
  readonly,
}: {
  capabilities: readonly AdvancedTextEditorCapability[];
  context: AdvancedTextEditorExtensionContext;
  placeholder: string | undefined;
  readonly: boolean | undefined;
}): AnyExtension[] => {
  const coreExtensions = buildAdvancedTextEditorCoreExtensions({ placeholder });

  return [
    // Email surfaces store page-level styling on the doc node itself, so
    // their document type replaces the plain one.
    ...(capabilities.includes('emailBlocks')
      ? coreExtensions.map((extension) =>
          extension.name === 'doc' ? EmailThemeDocument : extension,
        )
      : coreExtensions),
    ...capabilities
      .filter(
        (capability) => !(readonly === true && capability === 'slashCommand'),
      )
      .flatMap((capability) =>
        ADVANCED_TEXT_EDITOR_CAPABILITY_EXTENSIONS[capability](context),
      ),
  ];
};
