import { Editor } from '@tiptap/core';
import { Slice } from '@tiptap/pm/model';

import { type AdvancedTextEditorExtensionContext } from '@/advanced-text-editor/types/AdvancedTextEditorExtensionContext';
import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';
import { getStorableEditorDocument } from '@/advanced-text-editor/utils/getStorableEditorDocument';
import { insertUploadingFile } from '@/advanced-text-editor/utils/insertUploadingFile';
import { insertUploadingImage } from '@/advanced-text-editor/utils/insertUploadingImage';

jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactNodeViewRenderer: () => () => ({}),
}));

const originalCreateObjectURL = global.URL.createObjectURL;
const originalRevokeObjectURL = global.URL.revokeObjectURL;

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:placeholder');
  global.URL.revokeObjectURL = jest.fn();
});

afterAll(() => {
  global.URL.createObjectURL = originalCreateObjectURL;
  global.URL.revokeObjectURL = originalRevokeObjectURL;
});

const createEditorSavingEveryUpdate = (
  context: AdvancedTextEditorExtensionContext = {},
) => {
  const savedDocuments: string[] = [];

  const editor = new Editor({
    extensions: buildAdvancedTextEditorExtensions({
      profile: {
        chrome: 'document',
        variant: 'app',
        minHeight: 0,
        enableFullScreen: false,
        buildExtensions: buildRecordRichTextExtensions,
      } satisfies AdvancedTextEditorProfile,
      context,
      placeholder: undefined,
      readonly: false,
    }),
    onUpdate: ({ editor: updatedEditor }) => {
      savedDocuments.push(
        JSON.stringify(getStorableEditorDocument(updatedEditor)),
      );
    },
  });

  return { editor, savedDocuments };
};

const flushPromises = () => new Promise((resolve) => setTimeout(resolve, 0));

const FILE = new File(['content'], 'report.pdf', { type: 'application/pdf' });

const isClipboardEvent = (event: Event): event is ClipboardEvent =>
  'clipboardData' in event;

const pasteFiles = ({ editor, files }: { editor: Editor; files: File[] }) => {
  const pasteEvent = Object.assign(new Event('paste', { cancelable: true }), {
    clipboardData: { files, getData: () => '' },
  });

  if (!isClipboardEvent(pasteEvent)) {
    throw new Error('Expected a paste event carrying clipboard data');
  }

  editor.view.someProp('handlePaste', (handlePaste) =>
    handlePaste(editor.view, pasteEvent, Slice.empty),
  );
};

const onFileUpload = async (file: File) => ({
  url: `https://files.twenty.com/${file.name}`,
});

describe('uploading into the editor', () => {
  it('saves text typed during an upload, then the uploaded file url', async () => {
    const { editor, savedDocuments } = createEditorSavingEveryUpdate();

    insertUploadingFile({
      editor,
      file: FILE,
      onFileUpload: async () => ({
        url: 'https://files.twenty.com/report.pdf',
      }),
    });
    editor.commands.insertContent('typed while uploading');

    expect(savedDocuments.at(-1)).toContain('typed while uploading');
    expect(savedDocuments.at(-1)).not.toContain('blob:placeholder');

    await flushPromises();

    expect(savedDocuments.at(-1)).toContain(
      'https://files.twenty.com/report.pdf',
    );

    editor.destroy();
  });

  it('saves the uploaded image url once the image upload settles', async () => {
    const { editor, savedDocuments } = createEditorSavingEveryUpdate();

    insertUploadingImage({
      editor,
      file: FILE,
      onImageUpload: async () => ({ url: 'https://files.twenty.com/logo.png' }),
    });

    await flushPromises();

    expect(savedDocuments.at(-1)).toContain(
      'https://files.twenty.com/logo.png',
    );

    editor.destroy();
  });

  it('saves the document without the placeholder when the upload fails', async () => {
    const { editor, savedDocuments } = createEditorSavingEveryUpdate();

    insertUploadingFile({
      editor,
      file: FILE,
      onFileUpload: async () => {
        throw new Error('Upload failed');
      },
    });

    await flushPromises();

    expect(savedDocuments.at(-1)).not.toContain('blob:placeholder');

    editor.destroy();
  });

  it('uploads every pasted file, images as images and the rest as files', async () => {
    const { editor, savedDocuments } = createEditorSavingEveryUpdate({
      onImageUpload: async () => ({ url: 'https://files.twenty.com/logo.png' }),
      onFileUpload: async () => ({
        url: 'https://files.twenty.com/report.pdf',
      }),
    });
    pasteFiles({
      editor,
      files: [new File(['image'], 'logo.png', { type: 'image/png' }), FILE],
    });
    await flushPromises();

    expect(JSON.parse(savedDocuments.at(-1) ?? '{}').content).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'image',
          attrs: expect.objectContaining({
            src: 'https://files.twenty.com/logo.png',
          }),
        }),
        expect.objectContaining({
          type: 'file',
          attrs: expect.objectContaining({
            url: 'https://files.twenty.com/report.pdf',
          }),
        }),
      ]),
    );

    editor.destroy();
  });

  it('pastes a file after the task item holding the cursor, not inside it', async () => {
    const { editor } = createEditorSavingEveryUpdate({ onFileUpload });

    editor.commands.setContent({
      type: 'doc',
      content: [
        {
          type: 'taskList',
          content: ['First task', 'Second task'].map((text) => ({
            type: 'taskItem',
            attrs: { checked: false },
            content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
          })),
        },
      ],
    });
    editor.commands.setTextSelection(13);

    pasteFiles({ editor, files: [FILE] });
    await flushPromises();

    expect(editor.getJSON().content?.map(({ type }) => type)).toEqual([
      'taskList',
      'file',
      'taskList',
    ]);

    editor.destroy();
  });

  it('pastes files in order after the paragraph holding the cursor', async () => {
    const { editor } = createEditorSavingEveryUpdate({ onFileUpload });

    editor.commands.setContent({
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'hello world' }] },
      ],
    });
    editor.commands.setTextSelection(6);

    pasteFiles({
      editor,
      files: [
        new File(['first'], 'first.pdf', { type: 'application/pdf' }),
        new File(['second'], 'second.pdf', { type: 'application/pdf' }),
      ],
    });
    await flushPromises();

    expect(editor.getJSON().content).toEqual([
      expect.objectContaining({
        type: 'paragraph',
        content: [expect.objectContaining({ text: 'hello world' })],
      }),
      expect.objectContaining({
        attrs: expect.objectContaining({ name: 'first.pdf' }),
      }),
      expect.objectContaining({
        attrs: expect.objectContaining({ name: 'second.pdf' }),
      }),
    ]);

    editor.destroy();
  });

  it('never brings the placeholder back when undoing a slow upload', async () => {
    const { editor } = createEditorSavingEveryUpdate();
    let resolveUpload: (uploadedFile: { url: string }) => void = () => {};

    insertUploadingFile({
      editor,
      file: FILE,
      onFileUpload: () =>
        new Promise((resolve) => {
          resolveUpload = resolve;
        }),
    });

    const dateNowSpy = jest
      .spyOn(Date, 'now')
      .mockReturnValue(Date.now() + 60_000);

    resolveUpload({ url: 'https://files.twenty.com/report.pdf' });
    await flushPromises();

    editor.commands.undo();

    expect(JSON.stringify(editor.getJSON())).not.toContain('blob:placeholder');

    dateNowSpy.mockRestore();
    editor.destroy();
  });
});
