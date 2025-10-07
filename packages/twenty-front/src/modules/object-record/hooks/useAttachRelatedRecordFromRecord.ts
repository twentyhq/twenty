import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { computeDepthOneRecordGqlFieldsFromRecord } from '@/object-record/graphql/utils/computeDepthOneRecordGqlFieldsFromRecord';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { CustomError, isDefined } from 'twenty-shared/utils';

type useAttachRelatedRecordFromRecordProps = {
  recordObjectNameSingular: string;
  fieldNameOnRecordObject: string;
};

export const useAttachRelatedRecordFromRecord = ({
  recordObjectNameSingular,
  fieldNameOnRecordObject,
}: useAttachRelatedRecordFromRecordProps) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordObjectNameSingular,
  });

  const fieldOnObject = objectMetadataItem.readableFields.find((field) => {
    return field.name === fieldNameOnRecordObject;
  });

  const relatedRecordObjectNameSingular =
    fieldOnObject?.relation?.targetObjectMetadata.nameSingular;

  if (!relatedRecordObjectNameSingular) {
    throw new CustomError(
      `Could not find record related to ${recordObjectNameSingular}`,
      'RELATED_RECORD_NOT_FOUND',
    );
  }
  const { objectMetadataItem: relatedObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relatedRecordObjectNameSingular,
    });

  const fieldOnRelatedObject =
    fieldOnObject?.relation?.targetFieldMetadata.name;

  if (!fieldOnRelatedObject) {
    throw new CustomError(
      `Missing target field for ${fieldNameOnRecordObject}`,
      'MISSING_TARGET_FIELD',
    );
  }

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular: relatedRecordObjectNameSingular,
  });

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: recordObjectNameSingular,
  });

  const getRelatedRecordFromCache = useGetRecordFromCache({
    objectNameSingular: relatedRecordObjectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const updateOneRecordAndAttachRelations = async ({
    recordId,
    relatedRecordId,
  }: {
    recordId: string;
    relatedRecordId: string;
  }) => {
    const cachedRelatedRecord =
      getRelatedRecordFromCache<ObjectRecord>(relatedRecordId);

    if (!cachedRelatedRecord) {
      throw new Error('Could not find cached related record');
    }

    const previousRecordId = cachedRelatedRecord?.[`${fieldOnRelatedObject}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache<ObjectRecord>(previousRecordId);

      const previousRecordWithRelation = {
        ...cachedRelatedRecord,
        [fieldOnRelatedObject]: previousRecord,
      };
      const gqlFields = computeDepthOneRecordGqlFieldsFromRecord({
        objectMetadataItem: relatedObjectMetadataItem,
        record: previousRecordWithRelation,
      });
      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem: relatedObjectMetadataItem,
        cache: apolloCoreClient.cache,
        record: {
          ...cachedRelatedRecord,
          [fieldOnRelatedObject]: previousRecord,
        },
        recordGqlFields: gqlFields,
        objectPermissionsByObjectMetadataId,
      });
    }

    await updateOneRecord({
      idToUpdate: relatedRecordId,
      updateOneRecordInput: {
        [`${fieldOnRelatedObject}Id`]: recordId,
      },
    });
  };

  return { updateOneRecordAndAttachRelations };
};
