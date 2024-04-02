import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { Field } from '~/generated/graphql';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';
import { isDefined } from '~/utils/isDefined';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

import { Sort } from '../types/Sort';

export const turnSortsIntoOrderBy = (
  sorts: Sort[],
  fields: Pick<Field, 'id' | 'name'>[],
): OrderByField => {
  const fieldsById = mapArrayToObject(fields, ({ id }) => id);
  const sortsOrderBy = Object.fromEntries(
    sorts
      .map((sort) => {
        const correspondingField = fieldsById[sort.fieldMetadataId];

        if (isUndefinedOrNull(correspondingField)) {
          return undefined;
        }

        const direction: OrderBy =
          sort.direction === 'asc' ? 'AscNullsFirst' : 'DescNullsLast';

        return [correspondingField.name, direction];
      })
      .filter(isDefined),
  );

  return {
    ...sortsOrderBy,
    position: 'AscNullsFirst',
  };
};
