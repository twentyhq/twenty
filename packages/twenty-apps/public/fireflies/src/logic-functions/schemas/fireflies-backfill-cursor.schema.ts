import { z } from 'zod';

import { GRAPHQL_INT_MAXIMUM_VALUE } from 'src/logic-functions/constants/graphql-int-maximum-value.constant';

export const firefliesBackfillCursorSchema = z
  .object({
    fromDate: z.iso.datetime(),
    toDate: z.iso.datetime(),
    skip: z.int().nonnegative().max(GRAPHQL_INT_MAXIMUM_VALUE),
  })
  .refine(
    ({ fromDate, toDate }) => Date.parse(fromDate) <= Date.parse(toDate),
    {
      message: 'fromDate must be before or equal to toDate',
      path: ['fromDate'],
    },
  );
