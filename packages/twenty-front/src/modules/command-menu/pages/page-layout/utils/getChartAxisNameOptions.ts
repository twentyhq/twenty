export type AxisNameOption = 'NONE' | 'X' | 'Y' | 'BOTH';

export const getChartAxisNameOptions = (option: AxisNameOption) => {
  switch (option) {
    case 'NONE':
      return 'None';
    case 'X':
      return 'X axis';
    case 'Y':
      return 'Y axis';
    case 'BOTH':
      return 'Both';
  }
};
