import { Editor } from '@tiptap/react';
import { initializeEditorContent } from '../initializeEditorContent';

describe('initializeEditorContent', () => {
  const mockEditor = {
    commands: {
      insertContent: jest.fn(),
    },
  } as unknown as Editor;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle empty string', () => {
    initializeEditorContent(mockEditor, '');
    expect(mockEditor.commands.insertContent).not.toHaveBeenCalled();
  });

  it('should insert plain text correctly', () => {
    initializeEditorContent(mockEditor, 'Hello world');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(1);
    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith(
      'Hello world',
    );
  });

  it('should insert single variable correctly', () => {
    initializeEditorContent(mockEditor, '{{user.name}}');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(1);
    expect(mockEditor.commands.insertContent).toHaveBeenCalledWith({
      type: 'variableTag',
      attrs: { variable: '{{user.name}}' },
    });
  });

  it('should handle text with variable in the middle', () => {
    initializeEditorContent(mockEditor, 'Hello {{user.name}} world');

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
      ' world',
    );
  });

  it('should handle multiple variables', () => {
    initializeEditorContent(
      mockEditor,
      'Hello {{user.firstName}} {{user.lastName}}, welcome to {{app.name}}',
    );

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(6);
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
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      5,
      ', welcome to ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(6, {
      type: 'variableTag',
      attrs: { variable: '{{app.name}}' },
    });
  });

  it('should handle variables at the start and end', () => {
    initializeEditorContent(mockEditor, '{{start.var}} middle {{end.var}}');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(1, {
      type: 'variableTag',
      attrs: { variable: '{{start.var}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      2,
      ' middle ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, {
      type: 'variableTag',
      attrs: { variable: '{{end.var}}' },
    });
  });

  it('should handle consecutive variables', () => {
    initializeEditorContent(mockEditor, '{{var1}}{{var2}}{{var3}}');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(1, {
      type: 'variableTag',
      attrs: { variable: '{{var1}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{var2}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, {
      type: 'variableTag',
      attrs: { variable: '{{var3}}' },
    });
  });

  it('should handle whitespace between variables', () => {
    initializeEditorContent(mockEditor, '{{var1}}   {{var2}}  ');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(4);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(1, {
      type: 'variableTag',
      attrs: { variable: '{{var1}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, '   ');
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, {
      type: 'variableTag',
      attrs: { variable: '{{var2}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(4, '  ');
  });

  it('should handle nested variable syntax', () => {
    initializeEditorContent(mockEditor, 'Hello {{user.address.city}}!');

    expect(mockEditor.commands.insertContent).toHaveBeenCalledTimes(3);
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(
      1,
      'Hello ',
    );
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(2, {
      type: 'variableTag',
      attrs: { variable: '{{user.address.city}}' },
    });
    expect(mockEditor.commands.insertContent).toHaveBeenNthCalledWith(3, '!');
  });
});
