import { ObjectRecordQueryFilter } from '@/object-record/record-filter/types/ObjectRecordQueryFilter';

export const generateILikeFiltersForCompositeFields = (
  filterString: string,
  baseFieldName: string,
  subFields: string[],
) => {
  return filterString
    .split(' ')
    .reduce((previousValue: ObjectRecordQueryFilter[], currentValue) => {
      return [
        ...previousValue,
        ...subFields.map((subField) => {
          return {
            [baseFieldName]: {
              [subField]: {
                ilike: `%${currentValue}%`,
              },
            },
          };
        }),
      ];
    }, []);
};
