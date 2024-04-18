import {
  FullNameFilter,
  ObjectRecordQueryFilter,
} from '@/object-record/record-filter/types/ObjectRecordQueryFilter';

export const formatCompositeFilters = (
  filterString: string,
  baseFieldName = 'name',
  subFields = ['firstName', 'lastName'],
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
