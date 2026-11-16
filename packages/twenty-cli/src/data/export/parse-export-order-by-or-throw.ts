import { OrderByDirection } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { CliError } from '@/output/cli-error';
import { EXIT_CODE } from '@/output/constants/exit-code.constant';

type OrderBy = { [key: string]: OrderByDirection | OrderBy };

const ORDER_BY_DIRECTIONS = Object.values(OrderByDirection);

export const parseExportOrderByOrThrow = (expression: string): OrderBy[] => {
  const orderBy = expression.split(',').map((item) => {
    const match = /^([^\[\]]+)(?:\[([^\[\]]+)\])?$/.exec(item);
    const direction = ORDER_BY_DIRECTIONS.find(
      (allowed) => allowed === (match?.[2] ?? OrderByDirection.AscNullsFirst),
    );
    if (!isDefined(match) || !isDefined(direction)) {
      throw new CliError({
        code: 'USAGE',
        exitCode: EXIT_CODE.USAGE,
        message: 'Invalid REST order_by expression.',
        hint: 'Use field[direction], for example employees[DescNullsLast].',
      });
    }
    const [field, ...parents] = match[1].split('.').reverse();
    return parents.reduce<OrderBy>((value, parent) => ({ [parent]: value }), {
      [field]: direction,
    });
  });
  return orderBy.some((item) => Object.hasOwn(item, 'id'))
    ? orderBy
    : [...orderBy, { id: OrderByDirection.AscNullsLast }];
};
