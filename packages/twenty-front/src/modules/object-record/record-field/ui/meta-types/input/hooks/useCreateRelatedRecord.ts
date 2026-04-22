import { v4 } from 'uuid';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { buildRecordLabelPayload } from '@/object-record/utils/buildRecordLabelPayload';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type UseCreateRelatedRecordProps = {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: EnrichedObjectMetadataItem;
  relationObjectMetadataNameSingular: string;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  relationFieldMetadataItem: FieldMetadataItem;
  recordId: string;
};

// Creates a related record and wires up the relation without opening the side panel.
export const useCreateRelatedRecord = ({
  fieldMetadataItem,
  objectMetadataItem,
  relationObjectMetadataNameSingular,
  relationObjectMetadataItem,
  relationFieldMetadataItem,
  recordId,
}: UseCreateRelatedRecordProps) => {
  const { createOneRecord } = useCreateOneRecord({
    objectNameSingular: relationObjectMetadataNameSingular,
  });

  const { updateOneRecord } = useUpdateOneRecord();

  if (
    relationObjectMetadataNameSingular === 'workspaceMember' ||
    !isDefined(objectMetadataItem.nameSingular)
  ) {
    return { createRelatedRecord: undefined };
  }

  const relationFieldMetadataItemRelationType =
    relationFieldMetadataItem.settings?.relationType;

  return {
    createRelatedRecord: async (searchInput?: string): Promise<string> => {
      const newRecordId = v4();

      const createRecordPayload = buildRecordLabelPayload({
        id: newRecordId,
        searchInput,
        objectMetadataItem: relationObjectMetadataItem,
      });

      if (relationFieldMetadataItemRelationType === RelationType.MANY_TO_ONE) {
        const gqlField =
          relationFieldMetadataItem.type === FieldMetadataType.RELATION
            ? relationFieldMetadataItem.name
            : computeMorphRelationFieldName({
                fieldName: relationFieldMetadataItem.name,
                relationType: relationFieldMetadataItemRelationType,
                targetObjectMetadataNameSingular:
                  objectMetadataItem.nameSingular,
                targetObjectMetadataNamePlural: objectMetadataItem.namePlural,
              });

        createRecordPayload[`${gqlField}Id`] = recordId;
      }

      await createOneRecord(createRecordPayload);

      if (relationFieldMetadataItemRelationType === RelationType.ONE_TO_MANY) {
        await updateOneRecord({
          objectNameSingular: objectMetadataItem.nameSingular ?? '',
          idToUpdate: recordId,
          updateOneRecordInput: {
            [`${fieldMetadataItem.name}Id`]: newRecordId,
          },
        });
      }

      return newRecordId;
    },
  };
};
