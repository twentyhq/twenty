export const wrapperWithDoubleQuoteWhenUpperCase = (value: string) => {
  const needsQuoting = /[A-Z]/.test(value);

  return needsQuoting ? `"${value}"` : value;
};
