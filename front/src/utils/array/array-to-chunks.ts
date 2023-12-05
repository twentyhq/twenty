// split an array into subarrays of a given size
export const arrayToChunks = <T>(array: T[], size: number) => {
  const results = [];

  while (array.length) {
    results.push(array.splice(0, size));
  }

  return results;
};
