import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { generateDepthOneRecordGqlFields } from '@/object-record/graphql/utils/generateDepthOneRecordGqlFields';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from '~/utils/isDefined';

type useAttachRelatedRecordFromRecordProps = {
  recordObjectNameSingular: string;
  fieldNameOnRecordObject: string;
};

export const useAttachRelatedRecordFromRecord = ({
  recordObjectNameSingular,
  fieldNameOnRecordObject,
}: useAttachRelatedRecordFromRecordProps) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: recordObjectNameSingular,
  });

  const fieldOnObject = objectMetadataItem.fields.find((field) => {
    return field.name === fieldNameOnRecordObject;
  });

  const relatedRecordObjectNameSingular =
    fieldOnObject?.relationDefinition?.targetObjectMetadata.nameSingular;

  if (!relatedRecordObjectNameSingular) {
    throw new Error(
      `Could not find record related to ${recordObjectNameSingular}`,
    );
  }
  const { objectMetadataItem: relatedObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relatedRecordObjectNameSingular,
    });

  const fieldOnRelatedObject =
    fieldOnObject?.relationDefinition?.targetFieldMetadata.name;

  if (!fieldOnRelatedObject) {
    throw new Error(`Missing target field for ${fieldNameOnRecordObject}`);
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
      throw new Error('could not find cached related record');
    }

    const previousRecordId = cachedRelatedRecord?.[`${fieldOnRelatedObject}Id`];

    if (isDefined(previousRecordId)) {
      const previousRecord = getRecordFromCache<ObjectRecord>(previousRecordId);

      const previousRecordWithRelation = {
        ...cachedRelatedRecord,
        [fieldOnRelatedObject]: previousRecord,
      };
      const gqlFields = generateDepthOneRecordGqlFields({
        objectMetadataItem: relatedObjectMetadataItem,
        record: previousRecordWithRelation,
      });
      updateRecordFromCache({
        objectMetadataItems,
        objectMetadataItem: relatedObjectMetadataItem,
        cache: apolloClient.cache,
        record: {
          ...cachedRelatedRecord,
          [fieldOnRelatedObject]: previousRecord,
        },
        recordGqlFields: gqlFields,
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
