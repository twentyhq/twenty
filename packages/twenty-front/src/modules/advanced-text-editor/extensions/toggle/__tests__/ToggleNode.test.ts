import { Editor, type JSONContent } from '@tiptap/core';

import { type AdvancedTextEditorProfile } from '@/advanced-text-editor/types/AdvancedTextEditorProfile';
import { buildAdvancedTextEditorExtensions } from '@/advanced-text-editor/utils/buildAdvancedTextEditorExtensions';
import { buildRecordRichTextExtensions } from '@/advanced-text-editor/utils/buildRecordRichTextExtensions';

jest.mock('@tiptap/react', () => ({
  ...jest.requireActual('@tiptap/react'),
  ReactNodeViewRenderer: () => () => ({}),
}));

const createEditor = (content: JSONContent[]) =>
  new Editor({
    element: document.createElement('div'),
    extensions: buildAdvancedTextEditorExtensions({
      profile: {
        chrome: 'document',
        variant: 'app',
        minHeight: 0,
        enableFullScreen: false,
        buildExtensions: buildRecordRichTextExtensions,
      } satisfies AdvancedTextEditorProfile,
      context: {},
      placeholder: undefined,
      readonly: false,
    }),
    content: { type: 'doc', content },
  });

const paragraph = (text?: string): JSONContent =>
  text === undefined
    ? { type: 'paragraph' }
    : { type: 'paragraph', content: [{ type: 'text', text }] };

const toggle = (id: string, content: JSONContent[]): JSONContent => ({
  type: 'toggle',
  attrs: { id },
  content,
});

const getBlocks = (editor: Editor) =>
  editor.getJSON().content?.map(({ type, attrs, content }) => ({
    type,
    indent: attrs?.indent,
    children: content?.map((child) => child.type),
  }));

const pressKey = (editor: Editor, key: string) =>
  editor.view.dom.dispatchEvent(
    new KeyboardEvent('keydown', { key, bubbles: true }),
  );

const getToggleElement = (editor: Editor) =>
  editor.view.dom.querySelector<HTMLElement>('.toggle-block');

describe('ToggleNode', () => {
  beforeEach(() => window.localStorage.clear());

  it('turns the current paragraph into a toggle heading with a fresh id', () => {
    const editor = createEditor([paragraph('Agenda')]);

    editor.chain().setTextSelection(3).setToggle({ level: 2 }).run();

    const [toggleNode] = editor.getJSON().content ?? [];

    expect(toggleNode.type).toBe('toggle');
    expect(toggleNode.attrs?.id).toEqual(expect.any(String));
    expect(toggleNode.content).toEqual([
      {
        type: 'heading',
        attrs: expect.objectContaining({ level: 2 }),
        content: [{ type: 'text', text: 'Agenda' }],
      },
    ]);
    expect(editor.state.selection.from).toBe(4);
  });

  it('remembers whether a toggle is open per toggle id', () => {
    window.localStorage.setItem('toggle-meeting', 'true');

    const editor = createEditor([
      toggle('meeting', [paragraph('Meeting'), paragraph('Notes')]),
    ]);
    const toggleElement = getToggleElement(editor);

    expect(toggleElement?.dataset.open).toBe('true');

    toggleElement
      ?.querySelector<HTMLButtonElement>('.toggle-block-button')
      ?.click();

    expect(toggleElement?.dataset.open).toBe('false');
    expect(window.localStorage.getItem('toggle-meeting')).toBe('false');
  });

  it('offers to add a first block in an open empty toggle and opens when one is added', () => {
    const editor = createEditor([toggle('empty', [paragraph('Empty')])]);
    const toggleElement = getToggleElement(editor);

    expect(toggleElement?.dataset.open).toBe('false');
    expect(toggleElement?.querySelector('.toggle-block-add-button')).toBeNull();

    toggleElement
      ?.querySelector<HTMLButtonElement>('.toggle-block-button')
      ?.click();
    toggleElement
      ?.querySelector<HTMLButtonElement>('.toggle-block-add-button')
      ?.click();

    expect(getBlocks(editor)).toEqual([
      { type: 'toggle', indent: 0, children: ['paragraph', 'paragraph'] },
    ]);
    expect(toggleElement?.dataset.open).toBe('true');
  });

  it('creates the next toggle on Enter and turns an empty toggle back into a paragraph', () => {
    const editor = createEditor([toggle('first', [paragraph('First')])]);

    editor.commands.setTextSelection(7);
    pressKey(editor, 'Enter');

    expect(getBlocks(editor)).toEqual([
      { type: 'toggle', indent: 0, children: ['paragraph'] },
      { type: 'toggle', indent: 0, children: ['paragraph'] },
    ]);

    pressKey(editor, 'Enter');

    expect(getBlocks(editor)).toEqual([
      { type: 'toggle', indent: 0, children: ['paragraph'] },
      { type: 'paragraph', indent: 0, children: undefined },
    ]);
  });

  it('leaves an open toggle when Enter is pressed on its last empty line', () => {
    window.localStorage.setItem('toggle-open', 'true');

    const editor = createEditor([
      toggle('open', [paragraph('Open'), paragraph('Body'), paragraph()]),
    ]);

    editor.commands.setTextSelection(14);
    pressKey(editor, 'Enter');

    expect(getBlocks(editor)).toEqual([
      { type: 'toggle', indent: 0, children: ['paragraph', 'paragraph'] },
      { type: 'paragraph', indent: 0, children: undefined },
    ]);
  });

  it('unwraps a toggle on Backspace at the start of its title and keeps its content nested', () => {
    const editor = createEditor([
      toggle('nested', [paragraph('Title'), paragraph('Body')]),
    ]);

    editor.commands.setTextSelection(2);
    pressKey(editor, 'Backspace');

    expect(getBlocks(editor)).toEqual([
      { type: 'paragraph', indent: 0, children: ['text'] },
      { type: 'paragraph', indent: 1, children: ['text'] },
    ]);
  });

  it('gives a pasted copy of a toggle its own id', () => {
    const editor = createEditor([toggle('same', [paragraph('One')])]);

    editor.commands.insertContentAt(
      editor.state.doc.content.size,
      toggle('same', [paragraph('Two')]),
    );

    const [firstId, secondId] = (editor.getJSON().content ?? []).map(
      ({ attrs }) => attrs?.id,
    );

    expect(firstId).toBe('same');
    expect(secondId).not.toBe('same');
  });
});
