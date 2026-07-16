import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import {
  FieldMetadataType,
  type RecordGqlOperationFilter,
} from 'twenty-shared/types';
import {
  computeMorphRelationGqlFieldName,
  isDefined,
} from 'twenty-shared/utils';
import { RelationType } from '~/generated-metadata/graphql';

type GetRelationTableFilterArgs = {
  recordId: string;
  relationType: RelationType | undefined;
  inverseRelationFieldMetadataItem:
    | Pick<FieldMetadataItem, 'name' | 'type' | 'settings'>
    | undefined;
  recordObjectMetadataNameSingular: string | undefined;
  recordObjectMetadataNamePlural: string | undefined;
};

const resolveInverseRelationGqlFieldName = ({
  inverseRelationFieldMetadataItem,
  recordObjectMetadataNameSingular,
  recordObjectMetadataNamePlural,
}: Omit<GetRelationTableFilterArgs, 'recordId' | 'relationType'>) => {
  if (
    !isDefined(inverseRelationFieldMetadataItem) ||
    inverseRelationFieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return inverseRelationFieldMetadataItem?.name;
  }

  const morphRelationType =
    isDefined(inverseRelationFieldMetadataItem.settings) &&
    'relationType' in inverseRelationFieldMetadataItem.settings
      ? inverseRelationFieldMetadataItem.settings.relationType
      : undefined;

  if (
    !isDefined(morphRelationType) ||
    !isDefined(recordObjectMetadataNameSingular) ||
    !isDefined(recordObjectMetadataNamePlural)
  ) {
    return undefined;
  }

  return computeMorphRelationGqlFieldName({
    fieldName: inverseRelationFieldMetadataItem.name,
    relationType: morphRelationType,
    targetObjectMetadataNameSingular: recordObjectMetadataNameSingular,
    targetObjectMetadataNamePlural: recordObjectMetadataNamePlural,
  });
};

export const getRelationTableFilter = ({
  recordId,
  relationType,
  inverseRelationFieldMetadataItem,
  recordObjectMetadataNameSingular,
  recordObjectMetadataNamePlural,
}: GetRelationTableFilterArgs): RecordGqlOperationFilter | undefined => {
  if (relationType !== RelationType.ONE_TO_MANY) {
    return undefined;
  }

  const gqlFieldName = resolveInverseRelationGqlFieldName({
    inverseRelationFieldMetadataItem,
    recordObjectMetadataNameSingular,
    recordObjectMetadataNamePlural,
  });

  return isDefined(gqlFieldName)
    ? { [`${gqlFieldName}Id`]: { in: [recordId] } }
    : undefined;
};
