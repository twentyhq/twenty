import { parseMcpToolCallParams } from 'src/engine/api/mcp/utils/parse-mcp-tool-call-params.util';

describe('parseMcpToolCallParams', () => {
  it('should return the tool name and arguments', () => {
    expect(
      parseMcpToolCallParams({
        name: 'learn_tools',
        arguments: { toolNames: ['find_companies'] },
      }),
    ).toEqual({
      toolName: 'learn_tools',
      toolArguments: { toolNames: ['find_companies'] },
      progressToken: undefined,
    });
  });

  it.each([
    ['omitted arguments', { name: 'list_skills' }],
    ['null arguments', { name: 'list_skills', arguments: null }],
  ])('should accept a call with %s as no arguments', (_, params) => {
    expect(parseMcpToolCallParams(params)).toEqual({
      toolName: 'list_skills',
      toolArguments: undefined,
      progressToken: undefined,
    });
  });

  it.each([
    ['missing params', undefined],
    ['a missing name', { arguments: {} }],
    ['an empty name', { name: '', arguments: {} }],
    ['a non string name', { name: 42, arguments: {} }],
    ['array arguments', { name: 'learn_tools', arguments: [] }],
    ['string arguments', { name: 'learn_tools', arguments: 'toolNames' }],
  ])('should reject %s', (_, params) => {
    expect(parseMcpToolCallParams(params)).toBeUndefined();
  });

  it.each([['abc123'], [4], [0], [-7]])(
    'should return the progress token %p supplied by the client',
    (progressToken) => {
      expect(
        parseMcpToolCallParams({
          name: 'learn_tools',
          _meta: { progressToken },
        })?.progressToken,
      ).toBe(progressToken);
    },
  );

  it.each([
    ['_meta without progressToken', { other: 'value' }],
    ['a null _meta', null],
    ['a string _meta', 'abc123'],
  ])('should ignore %s', (_, meta) => {
    expect(
      parseMcpToolCallParams({ name: 'learn_tools', _meta: meta }),
    ).toEqual({
      toolName: 'learn_tools',
      toolArguments: undefined,
      progressToken: undefined,
    });
  });

  it.each([
    [true],
    [{}],
    [[]],
    [null],
    [1.5],
    [-0.25],
    [Number.NaN],
    [Number.POSITIVE_INFINITY],
  ])(
    'should ignore the non conformant progress token %p without failing the call',
    (progressToken) => {
      expect(
        parseMcpToolCallParams({
          name: 'learn_tools',
          _meta: { progressToken },
        }),
      ).toEqual({
        toolName: 'learn_tools',
        toolArguments: undefined,
        progressToken: undefined,
      });
    },
  );
});
