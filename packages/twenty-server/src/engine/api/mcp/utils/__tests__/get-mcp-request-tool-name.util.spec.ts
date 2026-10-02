import { getMcpRequestToolName } from 'src/engine/api/mcp/utils/get-mcp-request-tool-name.util';

describe('getMcpRequestToolName', () => {
  it('should return the called tool name', () => {
    expect(
      getMcpRequestToolName({
        method: 'tools/call',
        params: { name: 'find_many_people', arguments: {} },
      }),
    ).toBe('find_many_people');
  });

  it('should return the tool executed through execute_tool', () => {
    expect(
      getMcpRequestToolName({
        method: 'tools/call',
        params: {
          name: 'execute_tool',
          arguments: { toolName: 'create_one_company', arguments: {} },
        },
      }),
    ).toBe('create_one_company');
  });

  it('should return undefined for other methods', () => {
    expect(getMcpRequestToolName({ method: 'tools/list' })).toBeUndefined();
  });

  it('should return undefined when the tool name is missing', () => {
    expect(
      getMcpRequestToolName({
        method: 'tools/call',
        params: { name: '', arguments: {} },
      }),
    ).toBeUndefined();
  });
});
