import { OrderByDirection } from 'twenty-shared/types';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

type OrderBy = { [key: string]: OrderByDirection | OrderBy };

export const parseExportOrderBy = (expression: string): OrderBy[] => {
  const orderBy = expression.split(',').map((item) => {
    const match = /^([^\[\]]+)(?:\[([^\[\]]+)\])?$/.exec(item);
    const direction = match?.[2] ?? OrderByDirection.AscNullsFirst;
    if (
      !match ||
      !Object.values(OrderByDirection).some((allowed) => allowed === direction)
    ) {
      throw new CliError({
        code: 'USAGE',
        exitCode: EXIT_CODE.USAGE,
        message: 'Invalid REST order_by expression.',
        hint: 'Use field[direction], for example employees[DescNullsLast].',
      });
    }
    const fields = match[1].split('.');
    return fields
      .reverse()
      .reduce<OrderBy | OrderByDirection>(
        (value, field) => ({ [field]: value }),
        direction as OrderByDirection,
      ) as OrderBy;
  });
  return orderBy.some((item) => Object.hasOwn(item, 'id'))
    ? orderBy
    : [...orderBy, { id: OrderByDirection.AscNullsLast }];
};
