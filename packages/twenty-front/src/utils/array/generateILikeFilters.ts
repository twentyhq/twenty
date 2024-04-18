import {
  FullNameFilter,
  ObjectRecordQueryFilter,
} from '@/object-record/record-filter/types/ObjectRecordQueryFilter';

export const generateILikeFilters = (
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
            } as FullNameFilter,
          };
        }),
      ];
    }, []);
};
