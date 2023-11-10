import { Field } from '~/generated/graphql';

import { Sort } from '../types/Sort';

export const turnSortsIntoOrderByV2 = (
  sorts: Sort[],
  fields: Pick<Field, 'id' | 'name'>[],
) => {
  const sortsObject: Record<string, 'AscNullsFirst' | 'DescNullsLast'> = {};
  sorts.forEach((sort) => {
    const correspondingField = fields.find(
      (field) => field.id === sort.fieldId,
    );
    if (!correspondingField) {
      throw new Error(
        `Could not find field ${sort.fieldId} in metadata object`,
      );
    }
    const direction =
      sort.direction === 'asc' ? 'AscNullsFirst' : 'DescNullsLast';

    sortsObject[correspondingField.name] = direction;
  });

  return sortsObject;
};
