import { ThemeColor } from 'twenty-ui';

export const colorByStatus: Record<(typeof SSOIdp)['status'], ThemeColor> = {
  Active: 'green',
  Inactive: 'gray',
  Error: 'red',
};
