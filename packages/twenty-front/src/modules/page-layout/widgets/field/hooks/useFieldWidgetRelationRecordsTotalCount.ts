import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useAggregateRecords } from '@/object-record/hooks/useAggregateRecords';
import { type FieldRelationMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  computeMorphRelationGqlFieldName,
  isDefined,
} from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { RelationType } from '~/generated-metadata/graphql';

type UseFieldWidgetRelationRecordsTotalCountParams = {
  recordId: string;
  relationFieldMetadata: FieldRelationMetadata;
};

export const useFieldWidgetRelationRecordsTotalCount = ({
  recordId,
  relationFieldMetadata,
}: UseFieldWidgetRelationRecordsTotalCountParams) => {
  const {
    relationFieldMetadataId,
    relationObjectMetadataNameSingular,
    relationType,
    objectMetadataNameSingular,
  } = relationFieldMetadata;

  const { objectMetadataItems } = useObjectMetadataItems();

  const objectMetadataItem = objectMetadataItems.find(
    ({ nameSingular }) => nameSingular === objectMetadataNameSingular,
  );

  const { objectMetadataItem: relationObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: relationObjectMetadataNameSingular,
    });

  const relationFieldMetadataItem = relationObjectMetadataItem.fields.find(
    ({ id }) => id === relationFieldMetadataId,
  );

  const isToManyObjects = relationType === RelationType.ONE_TO_MANY;

  const getRelationGqlFieldName = () => {
    if (!isDefined(relationFieldMetadataItem)) {
      return undefined;
    }

    if (relationFieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
      return relationFieldMetadataItem.name;
    }

    if (!isDefined(objectMetadataItem)) {
      return undefined;
    }

    return computeMorphRelationGqlFieldName({
      fieldName: relationFieldMetadataItem.name,
      relationType: relationFieldMetadataItem.settings.relationType,
      targetObjectMetadataNameSingular: objectMetadataItem.nameSingular,
      targetObjectMetadataNamePlural: objectMetadataItem.namePlural,
    });
  };

  const gqlFieldName = getRelationGqlFieldName();

  const filter = isToManyObjects
    ? ({
        [doNotTranslate(`${gqlFieldName}Id`)]: {
          in: [recordId],
        },
      } satisfies RecordGqlOperationFilter)
    : {};

  const { data } = useAggregateRecords<{
    id: { COUNT: number };
  }>({
    objectNameSingular: relationObjectMetadataNameSingular,
    filter,
    skip: !isToManyObjects || !isDefined(gqlFieldName),
    recordGqlFieldsAggregate: {
      id: [AggregateOperations.COUNT],
    },
  });

  return { relationRecordsTotalCount: data?.id?.COUNT };
};
