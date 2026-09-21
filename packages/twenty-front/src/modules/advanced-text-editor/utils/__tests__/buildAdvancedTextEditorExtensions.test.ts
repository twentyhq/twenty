import { VariableTag } from '@/advanced-text-editor/extensions/variable-tag/VariableTag';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { buildFullRichTextExtensions } from '@/advanced-text-editor/utils/buildFullRichTextExtensions';
import { Document } from '@tiptap/extension-document';

const getExtensionNames = (
  extensions: ReturnType<typeof buildAdvancedTextEditorExtensions>,
) => extensions.map((extension) => extension.name);

describe('buildAdvancedTextEditorExtensions', () => {
  it('should always include core extensions', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      profile: createProfile(),
      context: {},
      placeholder: undefined,
      readonly: false,
    });

    expect(getExtensionNames(extensions)).toEqual(
      expect.arrayContaining([
        'doc',
        'paragraph',
        'text',
        'placeholder',
        'hardBreak',
        'undoRedo',
        'dropCursor',
      ]),
    );
  });

  it('should compose the extension set provided by the surface profile', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      profile: createProfile({
        buildExtensions: (context) => [
          ...buildFullRichTextExtensions(context),
          VariableTag,
        ],
      }),
      context: {},
      placeholder: undefined,
      readonly: false,
    });

    expect(getExtensionNames(extensions)).toEqual(
      expect.arrayContaining([
        'bold',
        'italic',
        'strike',
        'underline',
        'heading',
        'listKit',
        'link',
        'image',
        'uploadImage',
        'variableTag',
        'slash-command',
      ]),
    );
  });

  it('should allow a surface profile to replace the document extension', () => {
    const SurfaceDocument = Document.extend({ name: 'surfaceDocument' });
    const extensions = buildAdvancedTextEditorExtensions({
      profile: createProfile({ documentExtension: SurfaceDocument }),
      context: {},
      placeholder: undefined,
      readonly: false,
    });

    const extensionNames = getExtensionNames(extensions);

    expect(extensionNames).toContain('surfaceDocument');
    expect(extensionNames).not.toContain('doc');
  });

  it('should drop the slash command when readonly', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      profile: createProfile({
        buildExtensions: (context) => buildFullRichTextExtensions(context),
      }),
      context: {},
      placeholder: undefined,
      readonly: true,
    });

    expect(getExtensionNames(extensions)).not.toEqual(
      expect.arrayContaining(['slash-command']),
    );
  });

  it('should pass image upload callbacks to the upload extension', () => {
    const onImageUpload = jest.fn();

    const extensions = buildAdvancedTextEditorExtensions({
      profile: createProfile({
        buildExtensions: (context) => buildFullRichTextExtensions(context),
      }),
      context: { onImageUpload },
      placeholder: undefined,
      readonly: false,
    });

    const uploadImageExtension = extensions.find(
      (extension) => extension.name === 'uploadImage',
    );

    expect(uploadImageExtension?.options.onImageUpload).toBe(onImageUpload);
  });
});

const createProfile = (
  overrides: Partial<AdvancedTextEditorProfile> = {},
): AdvancedTextEditorProfile => ({
  chrome: 'document',
  minHeight: 0,
  enableFullScreen: false,
  buildExtensions: () => [],
  ...overrides,
});
