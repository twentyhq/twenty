export const getChipContentWidth = (numberOfChildren: number) => {
  if (numberOfChildren <= 1) {
    return 0;
  }
  if (numberOfChildren <= 10) {
    return 17;
  }
  if (numberOfChildren <= 100) {
    return 17 + 8;
  }
  if (numberOfChildren <= 1000) {
    return 17 + 8 * 2;
  }
  return 17 + 8 * (Math.trunc(Math.log10(numberOfChildren)) - 1);
};
