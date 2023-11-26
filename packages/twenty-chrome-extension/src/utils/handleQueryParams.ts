const handleQueryParams = (inputData: { [x: string]: unknown }): string => {
  let result = '';
  Object.keys(inputData).forEach((key) => {
    let quote = '';
    if (typeof inputData[key] === 'string') quote = '"';
    if (typeof inputData[key] === 'object') {
      result = result.concat(`${key}: {${handleQueryParams(inputData[key] as { [x: string]: unknown })}}, `);
    } else {
      result = result.concat(`${key}: ${quote}${inputData[key]}${quote}, `);
    }
  });
  if (result.length) result = result.slice(0, -2); // Remove the last ', '
  return result;
};

export default handleQueryParams;
