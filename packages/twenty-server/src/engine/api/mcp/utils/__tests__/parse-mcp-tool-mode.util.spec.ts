import { parseMcpToolMode } from 'src/engine/api/mcp/utils/parse-mcp-tool-mode.util';

describe('parseMcpToolMode', () => {
  it.each([
    [undefined, 'generic'],
    ['generic', 'generic'],
    ['unknown', 'generic'],
    ['direct', 'direct'],
    ['meta', 'meta'],
  ])('should read ?mode=%p as %p', (mode, expected) => {
    expect(parseMcpToolMode(mode)).toBe(expected);
  });
});
