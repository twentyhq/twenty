import { stripSeparators } from 'src/utils/strip-separators';

const SALARY_LOOKUP: Record<string, string> = {
  '<20000': 'UNDER_20000',
  '20000-25000': 'FROM_20000_TO_25000',
  '25000-35000': 'FROM_25000_TO_35000',
  '35000-45000': 'FROM_35000_TO_45000',
  '45000-55000': 'FROM_45000_TO_55000',
  '55000-70000': 'FROM_55000_TO_70000',
  '70000-85000': 'FROM_70000_TO_85000',
  '85000-100000': 'FROM_85000_TO_100000',
  '100000-150000': 'FROM_100000_TO_150000',
  '150000-250000': 'FROM_150000_TO_250000',
  '>250000': 'OVER_250000',
};

export const salaryTransform = (raw: string): string | undefined =>
  SALARY_LOOKUP[stripSeparators(raw)];
