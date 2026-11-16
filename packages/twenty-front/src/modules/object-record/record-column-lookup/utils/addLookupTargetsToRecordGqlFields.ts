import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlFields } from 'twenty-shared/types';
import { isPlainObject } from 'twenty-shared/utils';

export const addLookupTargetsToRecordGqlFields = ({
  recordGqlFields,
  lookupTargets,
}: {
  recordGqlFields: RecordGqlFields;
  lookupTargets: {
    relationFieldName: string;
    lookupTargetFieldMetadataItem: Pick<FieldMetadataItem, 'name'>;
  }[];
}) =>
  lookupTargets.reduce<RecordGqlFields>(
    (gqlFields, { relationFieldName, lookupTargetFieldMetadataItem }) => {
      const relationGqlFields = gqlFields[relationFieldName];

      if (!isPlainObject(relationGqlFields)) {
        return gqlFields;
      }

      return {
        ...gqlFields,
        [relationFieldName]: {
          ...relationGqlFields,
          [lookupTargetFieldMetadataItem.name]: true,
        },
      };
    },
    recordGqlFields,
  );
