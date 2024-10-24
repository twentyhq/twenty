import { Editor } from '@tiptap/react';
import { initializeEditorContent } from '../initializeEditorContent';

describe('initializeEditorContent', () => {
  let mockEditor: Editor;

  beforeEach(() => {
    mockEditor = {
      commands: {
        insertContent: jest.fn(),
      },
    } as unknown as Editor;
  });

  it('should handle single line text', () => {
    initializeEditorContent(mockEditor, 'Hello world');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(1);
    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
      'Hello world',
    );
  });

  it('should handle text with newlines', () => {
    initializeEditorContent(mockEditor, 'Line 1\nLine 2');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Line 1',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'hardBreak',
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      3,
      'Line 2',
    );
  });

  it('should handle single variable', () => {
    initializeEditorContent(mockEditor, '{{user.name}}');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(1);
    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith({
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
  });

  it('should handle text with variables', () => {
    initializeEditorContent(mockEditor, 'Hello {{user.name}}, welcome!');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      3,
      ', welcome!',
    );
  });

  it('should handle text with multiple variables', () => {
    initializeEditorContent(
      mockEditor,
      'Hello {{user.firstName}} {{user.lastName}}!',
    );

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(5);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.firstName}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, ' ');
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(4, {
      type: 'variableTag',
      attrs: { variable: '{{user.lastName}}' },
    });
  });

  it('should handle newlines with variables', () => {
    initializeEditorContent(
      mockEditor,
      'Hello {{user.name}}\nWelcome to {{app.name}}',
    );

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(5);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, {
      type: 'hardBreak',
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      4,
      'Welcome to ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(5, {
      type: 'variableTag',
      attrs: { variable: '{{app.name}}' },
    });
  });

  it('should handle empty strings', () => {
    initializeEditorContent(mockEditor, '');
    expect(mockEditor.commands.insertContent).not.toHaveBeenCalled();
  });

  it('should handle multiple empty parts', () => {
    initializeEditorContent(mockEditor, 'Hello    {{user.name}}    !');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello    ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      3,
      '    !',
    );
  });

  it('should handle multiple newlines', () => {
    initializeEditorContent(mockEditor, 'Line1\n\nLine3');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(4);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Line1',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'hardBreak',
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, {
      type: 'hardBreak',
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      4,
      'Line3',
    );
  });

  it('should ignore malformed variable tags', () => {
    initializeEditorContent(
      mockEditor,
      'Hello {{user.name}} and {{invalid}more}} text',
    );

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      3,
      ' and {{invalid}more}} text',
    );
  });

  it('should handle trailing newlines', () => {
    initializeEditorContent(mockEditor, 'Hello\n');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(2);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'hardBreak',
    });
  });
});
