// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stringifyWithoutKeyQuote = (obj: any) => {
  const jsonString = JSON.stringify(obj);

  return jsonString?.replace(/"(\w+)"\s*:/g, '$1:');
};
