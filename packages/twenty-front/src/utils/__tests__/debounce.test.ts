import { debounce } from '../debounce';

describe('debounce', () => {
  it('should debounce a function', () => {
    jest.useFakeTimers();

    const func = jest.fn();
    const debouncedFunc = debounce(func, 1000);

    debouncedFunc();
    debouncedFunc();
    debouncedFunc();

    expect(func).not.toHaveBeenCalled();

    jest.runAllTimers();

    expect(func).toHaveBeenCalledTimes(1);
  });
});
