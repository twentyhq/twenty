import { Fragment, Node, Schema } from 'prosemirror-model';
import { EditorState, TextSelection } from 'prosemirror-state';

import {
  backspaceBeforeAtomNodePlugin,
  findWordBoundaryAfter,
  findWordBoundaryBefore,
} from '@/blocknote-editor/extensions/BackspaceBeforeAtomNodeExtension';

// Minimal ProseMirror schema with an atom inline node to simulate mention chips.
// Position layout for paragraphs:
//   pos 0 = before paragraph, pos 1 = start of paragraph content,
//   each text char adds 1, each atom adds 1, last pos = end of content.
const testSchema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'inline*', group: 'block' },
    text: { group: 'inline' },
    mention: {
      group: 'inline',
      inline: true,
      atom: true,
      attrs: { label: { default: '' } },
      toDOM(node: Node) {
        return ['span', { class: 'mention' }, `@${node.attrs.label}`];
      },
      parseDOM: [{ tag: 'span.mention' }],
    },
  },
});

const createMention = (label: string) =>
  testSchema.nodes.mention.create({ label });

// Build a doc with a single paragraph from inline nodes.
const makeDoc = (...children: (Node | Node[])[]) => {
  const flatChildren = children.flat();

  return testSchema.node('doc', null, [
    testSchema.node('paragraph', null, Fragment.from(flatChildren)),
  ]);
};

// Create an EditorState and a mock EditorView that captures dispatched
// transactions. Avoids jsdom DOM rendering issues with prosemirror-view.
const setupTest = (docNode: Node) => {
  let currentState = EditorState.create({
    doc: docNode,
    plugins: [backspaceBeforeAtomNodePlugin],
  });

  const dispatched: { from: number; to: number }[] = [];

  const mockView = {
    get state() {
      return currentState;
    },
    dispatch(tr: ReturnType<typeof currentState.tr.delete>) {
      dispatched.push({
        from: (tr as any).steps[0]?.from ?? -1,
        to: (tr as any).steps[0]?.to ?? -1,
      });
      currentState = currentState.apply(tr);
    },
  };

  const setCursor = (pos: number) => {
    currentState = currentState.apply(
      currentState.tr.setSelection(
        TextSelection.create(currentState.doc, pos),
      ),
    );
  };

  const pressKey = (
    key: string,
    modifiers: { ctrlKey?: boolean; altKey?: boolean; metaKey?: boolean } = {},
  ): boolean => {
    const handleKeyDown = backspaceBeforeAtomNodePlugin.props.handleKeyDown!;

    return handleKeyDown.call(
      backspaceBeforeAtomNodePlugin,
      mockView as any,
      {
        key,
        ctrlKey: modifiers.ctrlKey ?? false,
        altKey: modifiers.altKey ?? false,
        metaKey: modifiers.metaKey ?? false,
        preventDefault: () => {},
      } as unknown as KeyboardEvent,
    ) as boolean;
  };

  const getText = () => {
    const paragraph = currentState.doc.firstChild!;
    const parts: string[] = [];

    paragraph.forEach((node) => {
      if (node.isText) {
        parts.push(node.text!);
      } else if (node.type.name === 'mention') {
        parts.push(`[@${node.attrs.label}]`);
      }
    });

    return parts.join('');
  };

  return { setCursor, pressKey, getText, dispatched };
};

describe('findWordBoundaryBefore', () => {
  it('should return 0 for a single word', () => {
    expect(findWordBoundaryBefore('hello')).toBe(0);
  });

  it('should find boundary between two words', () => {
    expect(findWordBoundaryBefore('hello world')).toBe(6);
  });

  it('should skip trailing whitespace', () => {
    expect(findWordBoundaryBefore('hello   ')).toBe(0);
  });

  it('should return 0 for empty string', () => {
    expect(findWordBoundaryBefore('')).toBe(0);
  });

  it('should handle multiple words', () => {
    expect(findWordBoundaryBefore('one two three')).toBe(8);
  });

  it('should handle single character', () => {
    expect(findWordBoundaryBefore('a')).toBe(0);
  });
});

describe('findWordBoundaryAfter', () => {
  it('should consume the first word', () => {
    expect(findWordBoundaryAfter('hello world')).toBe(5);
  });

  it('should skip leading whitespace then consume word', () => {
    expect(findWordBoundaryAfter('  hello')).toBe(7);
  });

  it('should return text length for single word', () => {
    expect(findWordBoundaryAfter('hello')).toBe(5);
  });

  it('should return 0 for empty string', () => {
    expect(findWordBoundaryAfter('')).toBe(0);
  });

  it('should handle single character', () => {
    expect(findWordBoundaryAfter('a')).toBe(1);
  });
});

describe('backspaceBeforeAtomNodePlugin', () => {
  describe('Backspace', () => {
    it('should delete text character before a mention', () => {
      // "d[@John]" — pos 2 is between "d" and mention
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(testSchema.text('d'), createMention('John')),
      );

      setCursor(2);

      const handled = pressKey('Backspace');

      expect(handled).toBe(true);
      expect(getText()).toBe('[@John]');
    });

    it('should delete text character in longer text before a mention', () => {
      // "hello[@John]" — pos 6 is between text end and mention
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(testSchema.text('hello'), createMention('John')),
      );

      setCursor(6);

      const handled = pressKey('Backspace');

      expect(handled).toBe(true);
      expect(getText()).toBe('hell[@John]');
    });

    it('should not intervene when cursor is at start of paragraph', () => {
      // "[@John] text" — pos 1 is start of paragraph content
      const { setCursor, pressKey } = setupTest(
        makeDoc(createMention('John'), testSchema.text(' text')),
      );

      setCursor(1);

      const handled = pressKey('Backspace');

      expect(handled).toBe(false);
    });

    it('should not intervene when next node is not an atom', () => {
      // "hello world" — pos 6 has nodeAfter=text (not atom)
      const { setCursor, pressKey } = setupTest(
        makeDoc(testSchema.text('hello world')),
      );

      setCursor(6);

      const handled = pressKey('Backspace');

      expect(handled).toBe(false);
    });

    it('should not intervene between two adjacent mentions', () => {
      // "[@Alice][@Bob]" — pos 2 is between two mentions
      // nodeBefore=mention (not text), so plugin must not intervene
      const { setCursor, pressKey } = setupTest(
        makeDoc(createMention('Alice'), createMention('Bob')),
      );

      setCursor(2);

      const handled = pressKey('Backspace');

      expect(handled).toBe(false);
    });

    it('should not intervene when selection is not empty', () => {
      let state = EditorState.create({
        doc: makeDoc(testSchema.text('hello'), createMention('John')),
        plugins: [backspaceBeforeAtomNodePlugin],
      });

      // Create a non-empty selection (select "lo", pos 4 to 6)
      state = state.apply(
        state.tr.setSelection(TextSelection.create(state.doc, 4, 6)),
      );

      const mockView = {
        state,
        dispatch: jest.fn(),
      };

      const handled = backspaceBeforeAtomNodePlugin.props.handleKeyDown!.call(
        backspaceBeforeAtomNodePlugin,
        mockView as any,
        {
          key: 'Backspace',
          ctrlKey: false,
          altKey: false,
          metaKey: false,
          preventDefault: () => {},
        } as unknown as KeyboardEvent,
      ) as boolean;

      expect(handled).toBe(false);
      expect(mockView.dispatch).not.toHaveBeenCalled();
    });

    it('should pass through Cmd+Backspace (line delete)', () => {
      const { setCursor, pressKey, dispatched } = setupTest(
        makeDoc(testSchema.text('hello'), createMention('John')),
      );

      setCursor(6);

      const handled = pressKey('Backspace', { metaKey: true });

      expect(handled).toBe(false);
      expect(dispatched).toHaveLength(0);
    });
  });

  describe('Ctrl+Backspace (word delete)', () => {
    it('should delete the preceding word before a mention', () => {
      // "hello [@John]" — pos 7 is between text and mention
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(testSchema.text('hello '), createMention('John')),
      );

      setCursor(7);

      const handled = pressKey('Backspace', { ctrlKey: true });

      expect(handled).toBe(true);
      // findWordBoundaryBefore("hello ") → 0 (skips space, then "hello")
      expect(getText()).toBe('[@John]');
    });

    it('should delete only the last word when multiple words precede mention', () => {
      // "one two [@John]" — pos 9 is between text and mention
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(testSchema.text('one two '), createMention('John')),
      );

      setCursor(9);

      const handled = pressKey('Backspace', { ctrlKey: true });

      expect(handled).toBe(true);
      // findWordBoundaryBefore("one two ") → 4 (skips " ", then "two")
      expect(getText()).toBe('one [@John]');
    });
  });

  describe('Delete', () => {
    it('should delete text character after a mention', () => {
      // "[@John]x" — pos 2 is between mention and "x"
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(createMention('John'), testSchema.text('x')),
      );

      setCursor(2);

      const handled = pressKey('Delete');

      expect(handled).toBe(true);
      expect(getText()).toBe('[@John]');
    });

    it('should delete text character in longer text after a mention', () => {
      // "[@John] world" — pos 2 is between mention and " world"
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(createMention('John'), testSchema.text(' world')),
      );

      setCursor(2);

      const handled = pressKey('Delete');

      expect(handled).toBe(true);
      expect(getText()).toBe('[@John]world');
    });

    it('should not intervene when previous node is not an atom', () => {
      // "hello world" — pos 6 has nodeBefore=text (not atom)
      const { setCursor, pressKey } = setupTest(
        makeDoc(testSchema.text('hello world')),
      );

      setCursor(6);

      const handled = pressKey('Delete');

      expect(handled).toBe(false);
    });

    it('should not intervene when content after cursor is not text', () => {
      // "[@Alice][@Bob]" — pos 2 has nodeAfter=mention (not text)
      const { setCursor, pressKey } = setupTest(
        makeDoc(createMention('Alice'), createMention('Bob')),
      );

      setCursor(2);

      const handled = pressKey('Delete');

      expect(handled).toBe(false);
    });
  });

  describe('Ctrl+Delete (forward word delete)', () => {
    it('should delete the following word after a mention', () => {
      // "[@John] hello" — pos 2 is between mention and " hello"
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(createMention('John'), testSchema.text(' hello')),
      );

      setCursor(2);

      const handled = pressKey('Delete', { ctrlKey: true });

      expect(handled).toBe(true);
      // findWordBoundaryAfter(" hello") → 6 (skips " ", then "hello")
      expect(getText()).toBe('[@John]');
    });

    it('should delete only the next word when multiple words follow mention', () => {
      // "[@John] one two" — pos 2 is between mention and " one two"
      const { setCursor, pressKey, getText } = setupTest(
        makeDoc(createMention('John'), testSchema.text(' one two')),
      );

      setCursor(2);

      const handled = pressKey('Delete', { ctrlKey: true });

      expect(handled).toBe(true);
      // findWordBoundaryAfter(" one two") → 4 (skips " ", then "one")
      expect(getText()).toBe('[@John] two');
    });
  });

  describe('non-matching keys', () => {
    it('should not handle Enter key', () => {
      const { setCursor, pressKey } = setupTest(
        makeDoc(testSchema.text('hello'), createMention('John')),
      );

      setCursor(6);

      expect(pressKey('Enter')).toBe(false);
    });

    it('should not handle regular character keys', () => {
      const { setCursor, pressKey } = setupTest(
        makeDoc(testSchema.text('hello'), createMention('John')),
      );

      setCursor(6);

      expect(pressKey('a')).toBe(false);
    });
  });
});
