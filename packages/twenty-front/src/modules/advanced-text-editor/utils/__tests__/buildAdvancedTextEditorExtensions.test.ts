import { ADVANCED_TEXT_EDITOR_PRESETS } from '@/advanced-text-editor/constants/AdvancedTextEditorPresets';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';

const getExtensionNames = (
  extensions: ReturnType<typeof buildAdvancedTextEditorExtensions>,
) => extensions.map((extension) => extension.name);

describe('buildAdvancedTextEditorExtensions', () => {
  it('should always include core extensions', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      capabilities: [],
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

  it('should build the structured email extension set for campaign bodies', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      capabilities: ADVANCED_TEXT_EDITOR_PRESETS.campaignBody.capabilities,
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
        'section',
        'columns',
        'column',
        'button',
        'divider',
        'html',
      ]),
    );
  });

  it('should only add mention extensions on top of core for the aiChat preset', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      capabilities: ADVANCED_TEXT_EDITOR_PRESETS.aiChat.capabilities,
      context: {},
      placeholder: undefined,
      readonly: false,
    });

    const extensionNames = getExtensionNames(extensions);

    expect(extensionNames).toEqual(
      expect.arrayContaining(['mentionTag', 'mention-suggestion']),
    );
    expect(extensionNames).not.toEqual(expect.arrayContaining(['bold']));
    expect(extensionNames).not.toEqual(expect.arrayContaining(['heading']));
    expect(extensionNames).not.toEqual(
      expect.arrayContaining(['slash-command']),
    );
  });

  it('should drop the slash command when readonly', () => {
    const extensions = buildAdvancedTextEditorExtensions({
      capabilities: ['slashCommand'],
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
      capabilities: ['images'],
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
