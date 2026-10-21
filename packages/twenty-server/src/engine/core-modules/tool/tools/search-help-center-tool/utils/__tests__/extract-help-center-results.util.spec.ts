import { extractHelpCenterResults } from 'src/engine/core-modules/tool/tools/search-help-center-tool/utils/extract-help-center-results.util';

const buildSseFrame = (message: object) =>
  `event: message\ndata: ${JSON.stringify(message)}\n\n`;

const buildSearchResultText = (index: number) =>
  `Title: Article ${index}\nLink: https://docs.twenty.com/article-${index}\nPage: article-${index}\nContent: Content ${index}`;

describe('extractHelpCenterResults', () => {
  it('reads the text of each search result and keeps the first five', () => {
    const body = buildSseFrame({
      result: {
        content: [1, 2, 3, 4, 5, 6].map((index) => ({
          type: 'text',
          text: buildSearchResultText(index),
        })),
      },
      jsonrpc: '2.0',
      id: 1,
    });

    expect(extractHelpCenterResults(body)).toEqual({
      isReadable: true,
      results: [1, 2, 3, 4, 5].map(buildSearchResultText),
    });
  });

  it('reports a JSON-RPC error with its message', () => {
    const body = buildSseFrame({
      jsonrpc: '2.0',
      id: 1,
      error: { code: -32602, message: 'Tool nope not found' },
    });

    expect(extractHelpCenterResults(body)).toEqual({
      isReadable: false,
      error: 'Tool nope not found',
    });
  });

  it('reports a tool error with its text', () => {
    const body = buildSseFrame({
      result: {
        content: [{ type: 'text', text: 'No results found' }],
        isError: true,
      },
      jsonrpc: '2.0',
      id: 1,
    });

    expect(extractHelpCenterResults(body)).toEqual({
      isReadable: false,
      error: 'No results found',
    });
  });

  it('reports a body without an SSE data line as unreadable', () => {
    for (const body of [
      '<html>Bad Gateway</html>',
      'event: message\ndata: {not json\n\n',
      { results: [] },
      undefined,
    ]) {
      expect(extractHelpCenterResults(body)).toEqual({
        isReadable: false,
        error:
          'Help center search returned a response in an unrecognized shape',
      });
    }
  });
});
