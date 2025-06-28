export const stringifyWithoutKeyQuote = (obj: unknown) => {
  const jsonString = JSON.stringify(obj);
  const jsonWithoutQuotes = jsonString?.replace(/"(\w+)"\s*:/g, '$1:');

  return jsonWithoutQuotes;
};
