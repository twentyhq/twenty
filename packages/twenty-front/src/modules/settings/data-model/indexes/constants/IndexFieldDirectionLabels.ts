import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';

import { OrderByDirection } from '~/generated-metadata/graphql';

export const INDEX_FIELD_DIRECTION_LABELS: Record<
  OrderByDirection,
  MessageDescriptor
> = {
  [OrderByDirection.AscNullsLast]: msg`Ascending`,
  [OrderByDirection.DescNullsLast]: msg`Descending`,
  [OrderByDirection.AscNullsFirst]: msg`Ascending, empty first`,
  [OrderByDirection.DescNullsFirst]: msg`Descending, empty first`,
};
