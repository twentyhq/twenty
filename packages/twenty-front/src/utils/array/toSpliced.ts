type ToSplicedFn = {
  <T>(array: T[], start: number, deleteCount?: number): T[];
  <T>(array: T[], start: number, deleteCount: number, ...items: T[]): T[];
};

// Polyfill for Array.prototype.toSpliced, which our lowest supported runtimes lack
export const toSpliced: ToSplicedFn = (array, ...args) => {
  const arrayCopy = [...array];
  arrayCopy.splice(...(args as [number, number, ...any[]]));
  return arrayCopy;
};
