import { getMcpRequestLogFields } from 'src/engine/api/mcp/utils/get-mcp-request-log-fields.util';

describe('getMcpRequestLogFields', () => {
  it('should return the method and the called tool name', () => {
    expect(
      getMcpRequestLogFields({
        method: 'tools/call',
        params: { name: 'find_many_people', arguments: {} },
      }),
    ).toEqual({ method: 'tools/call', toolName: 'find_many_people' });
  });

  it('should return the tool executed through execute_tool', () => {
    expect(
      getMcpRequestLogFields({
        method: 'tools/call',
        params: {
          name: 'execute_tool',
          arguments: { toolName: 'create_one_company', arguments: {} },
        },
      }).toolName,
    ).toBe('create_one_company');
  });

  it('should not return a tool name for other methods', () => {
    expect(getMcpRequestLogFields({ method: 'tools/list' })).toEqual({
      method: 'tools/list',
      toolName: undefined,
    });
  });

  it('should drop values that do not look like a method or tool name', () => {
    expect(
      getMcpRequestLogFields({
        method: 'tools/call',
        params: { name: 'find_many_people\nfake=line', arguments: {} },
      }).toolName,
    ).toBeUndefined();
    expect(
      getMcpRequestLogFields({ method: 'x'.repeat(129) }).method,
    ).toBeUndefined();
  });

  it('should keep values at the length limit', () => {
    expect(getMcpRequestLogFields({ method: 'x'.repeat(128) }).method).toBe(
      'x'.repeat(128),
    );
  });
});
