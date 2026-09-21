import { buildAdvancedTextEditorCoreExtensions } from '@/advanced-text-editor/constants/AdvancedTextEditorCoreExtensions';
import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { type AnyExtension } from '@tiptap/core';

export const buildAdvancedTextEditorExtensions = ({
  profile,
  context,
  placeholder,
  readonly,
}: {
  profile: AdvancedTextEditorProfile;
  context: AdvancedTextEditorExtensionContext;
  placeholder: string | undefined;
  readonly: boolean | undefined;
}): AnyExtension[] => {
  const coreExtensions = buildAdvancedTextEditorCoreExtensions({ placeholder });
  const profileExtensions = profile.buildExtensions(context);
  const { documentExtension } = profile;

  return [
    ...(documentExtension
      ? coreExtensions.map((extension) =>
          extension.name === 'doc' ? documentExtension : extension,
        )
      : coreExtensions),
    ...profileExtensions.filter(
      (extension) => !(readonly === true && extension.name === 'slash-command'),
    ),
  ];
};
