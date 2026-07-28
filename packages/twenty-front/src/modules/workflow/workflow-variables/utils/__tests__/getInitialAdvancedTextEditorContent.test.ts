import { getInitialAdvancedTextEditorContent } from '@/workflow/workflow-variables/utils/getInitialAdvancedTextEditorContent';

describe('getInitialAdvancedTextEditorContent', () => {
  it('should return an empty document when the content is blank', () => {
    expect(getInitialAdvancedTextEditorContent('   ')).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [] }],
    });
  });

  it('should return the parsed document when the content is TipTap JSON', () => {
    const document = {
      type: 'doc',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: 'Hello' }] },
      ],
    };

    expect(getInitialAdvancedTextEditorContent(JSON.stringify(document))).toEqual(
      document,
    );
  });

  it('should wrap a BlockNote array in a document', () => {
    const blocks = [{ type: 'paragraph', content: [] }];

    expect(getInitialAdvancedTextEditorContent(JSON.stringify(blocks))).toEqual({
      type: 'doc',
      content: blocks,
    });
  });

  it('should hand legacy HTML back untouched so TipTap parses it', () => {
    const html = '<p>Hi <strong>there</strong></p><p>Bye</p>';

    expect(getInitialAdvancedTextEditorContent(html)).toBe(html);
  });

  it('should hand legacy HTML back untouched when it is indented', () => {
    const html = '\n  <h1 class="title">Title</h1>';

    expect(getInitialAdvancedTextEditorContent(html)).toBe(html);
  });

  it('should still convert plain text with variables into variable tags', () => {
    expect(getInitialAdvancedTextEditorContent('Hi {{firstName}}')).toEqual({
      type: 'doc',
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'Hi ' },
            { type: 'variableTag', attrs: { variable: '{{firstName}}' } },
          ],
        },
      ],
    });
  });

  it('should not treat plain text that merely contains angle brackets as HTML', () => {
    const text = 'Reply to a <b>bold</b> claim';

    expect(getInitialAdvancedTextEditorContent(text)).toEqual({
      type: 'doc',
      content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
    });
  });
});
