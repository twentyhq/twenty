// Convert extracted data into a structure that can be sent to the server for storage.
const handleQueryParams = (inputData: { [x: string]: unknown }): string => {
  let result = '';
  Object.keys(inputData).forEach((key) => {
    let quote = '';
    if (typeof inputData[key] === 'string') quote = '"';
    if (typeof inputData[key] === 'object') {
      result = result.concat(
        `${key}: {${handleQueryParams(
          inputData[key] as { [x: string]: unknown },
        )}}, `,
      );
    } else {
      result = result.concat(`${key}: ${quote}${inputData[key]}${quote}, `);
    }
  });
  if (result.length > 0) result = result.slice(0, -2); // Remove the last ', '
  return result;
};

export default handleQueryParams;
