export const debounce = <FuncArgs extends any[]>(
  func: (...args: FuncArgs) => void,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: FuncArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};
