export const getChipContentWidth = (numberOfChildren: number) => {
  if (numberOfChildren <= 1) {
    return 0;
  }
  return 17 + 8 * Math.trunc(Math.log10(numberOfChildren));
};
