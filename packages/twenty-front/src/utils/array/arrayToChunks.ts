// split an array into subarrays of a given size
export const arrayToChunks = <T>(array: T[], size: number) => {
  const arrayCopy = [...array];
  const results = [];

  while (arrayCopy.length) {
    results.push(arrayCopy.splice(0, size));
  }

  return results;
};
