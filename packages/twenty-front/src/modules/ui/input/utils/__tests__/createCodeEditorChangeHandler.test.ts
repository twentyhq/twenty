import { createCodeEditorChangeHandler } from '@/ui/input/utils/createCodeEditorChangeHandler';

describe('createCodeEditorChangeHandler', () => {
  it('skips undefined values', () => {
    const onChange = jest.fn();
    const handleChange = createCodeEditorChangeHandler(onChange);

    expect(handleChange(undefined)).toBeUndefined();
    expect(onChange).not.toHaveBeenCalled();
  });

  it('forwards an empty string', () => {
    const onChange = jest.fn();
    const handleChange = createCodeEditorChangeHandler(onChange);

    handleChange('');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('');
  });

  it('preserves the callback promise and its result', async () => {
    const saveCodeResult = Promise.resolve('saved');
    const onChange = jest.fn(() => saveCodeResult);
    const handleChange = createCodeEditorChangeHandler(onChange);

    const result = handleChange('const value = 1;');

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('const value = 1;');
    expect(result).toBe(saveCodeResult);
    await expect(result).resolves.toBe('saved');
  });
});
