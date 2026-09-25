import { isDefined } from 'twenty-shared/utils';
import { And, LessThan, MoreThanOrEqual, type FindOperator } from 'typeorm';

export const buildStartsAtCondition = ({
  startsAtFrom,
  startsAtBefore,
}: {
  startsAtFrom?: Date;
  startsAtBefore?: Date;
}): FindOperator<string> | undefined => {
  const conditions = [
    ...(isDefined(startsAtFrom)
      ? [MoreThanOrEqual(startsAtFrom.toISOString())]
      : []),
    ...(isDefined(startsAtBefore)
      ? [LessThan(startsAtBefore.toISOString())]
      : []),
  ];

  return conditions.length > 0 ? And(...conditions) : undefined;
};
