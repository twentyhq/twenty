import { OrderBy } from '@/object-metadata/types/OrderBy';
import { OrderByField } from '@/object-metadata/types/OrderByField';
import { Field } from '~/generated/graphql';
import { mapArrayToObject } from '~/utils/array/mapArrayToObject';

import { Sort } from '../types/Sort';

export const turnSortsIntoOrderBy = (
  sorts: Sort[],
  fields: Pick<Field, 'id' | 'name'>[],
): OrderByField => {
  const fieldsById = mapArrayToObject(fields, ({ id }) => id);
  const sortsOrderBy = Object.fromEntries(
    sorts.map((sort) => {
      const correspondingField = fieldsById[sort.fieldMetadataId];

      if (!correspondingField) {
        throw new Error(
          `Could not find field ${sort.fieldMetadataId} in metadata object`,
        );
      }

      const direction: OrderBy =
        sort.direction === 'asc' ? 'AscNullsFirst' : 'DescNullsLast';

      return [correspondingField.name, direction];
    }),
  );

  return {
    ...sortsOrderBy,
    position: 'AscNullsFirst',
  };
};
