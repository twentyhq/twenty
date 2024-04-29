import { RecordGqlOperationFilter } from '@/object-record/graphql/types/RecordGqlOperationFilter';

export const generateILikeFiltersForCompositeFields = (
  filterString: string,
  baseFieldName: string,
  subFields: string[],
) => {
  return filterString
    .split(' ')
    .reduce((previousValue: RecordGqlOperationFilter[], currentValue) => {
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
