import { isNumber } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const isBookCallQualified = ({
  minEmployeeCount,
  employeeCount,
}: {
  minEmployeeCount: number | null;
  employeeCount: number | null | undefined;
}): boolean =>
  isDefined(minEmployeeCount) &&
  isNumber(employeeCount) &&
  employeeCount >= minEmployeeCount;
