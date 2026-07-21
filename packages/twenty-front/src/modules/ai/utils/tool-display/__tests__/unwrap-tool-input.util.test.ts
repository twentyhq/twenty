import { unwrapToolInput } from '@/ai/utils/tool-display/unwrap-tool-input.util';

describe('unwrapToolInput', () => {
  it('should leave non-execute_tool tools untouched', () => {
    const input = { limit: 10 };

    expect(unwrapToolInput({ input, toolName: 'find_many_companies' })).toEqual({
      toolInput: input,
      toolName: 'find_many_companies',
    });
  });

  it('should unwrap the inner tool name and arguments', () => {
    expect(
      unwrapToolInput({
        input: { toolName: 'find_many_companies', arguments: { limit: 10 } },
        toolName: 'execute_tool',
      }),
    ).toEqual({
      toolInput: { limit: 10 },
      toolName: 'find_many_companies',
    });
  });

  it('should fall back to execute_tool when the inner tool name is missing', () => {
    const input = { arguments: { limit: 10 } };

    expect(unwrapToolInput({ input, toolName: 'execute_tool' })).toEqual({
      toolInput: input,
      toolName: 'execute_tool',
    });
  });

  it('should fall back to execute_tool when the inner tool name is empty', () => {
    const input = { toolName: '', arguments: {} };

    expect(unwrapToolInput({ input, toolName: 'execute_tool' })).toEqual({
      toolInput: input,
      toolName: 'execute_tool',
    });
  });

  it('should fall back to execute_tool when the inner tool name is not a string', () => {
    const input = { toolName: 42, arguments: {} };

    expect(unwrapToolInput({ input, toolName: 'execute_tool' })).toEqual({
      toolInput: input,
      toolName: 'execute_tool',
    });
  });

  it('should fall back to execute_tool when the input is empty', () => {
    const input = {};

    expect(unwrapToolInput({ input, toolName: 'execute_tool' })).toEqual({
      toolInput: input,
      toolName: 'execute_tool',
    });
  });
});
