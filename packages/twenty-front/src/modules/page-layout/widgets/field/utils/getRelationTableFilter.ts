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
  // The inverse relation field (on the related object) pointing back to the
  // record's object: its name + "Id" is the foreign key to filter on.
  inverseRelationFieldMetadataItem:
    | Pick<FieldMetadataItem, 'name' | 'type' | 'settings'>
    | undefined;
  // The host record's own object names, needed only to resolve the gql field
  // name of a morph relation.
  recordObjectMetadataNameSingular: string | undefined;
  recordObjectMetadataNamePlural: string | undefined;
};

const resolveInverseRelationGqlFieldName = ({
  inverseRelationFieldMetadataItem,
  recordObjectMetadataNameSingular,
  recordObjectMetadataNamePlural,
}: {
  inverseRelationFieldMetadataItem: Pick<
    FieldMetadataItem,
    'name' | 'type' | 'settings'
  >;
  recordObjectMetadataNameSingular: string | undefined;
  recordObjectMetadataNamePlural: string | undefined;
}): string | undefined => {
  if (
    inverseRelationFieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION
  ) {
    return inverseRelationFieldMetadataItem.name;
  }

  const settings = inverseRelationFieldMetadataItem.settings;
  const morphRelationType =
    isDefined(settings) && 'relationType' in settings
      ? settings.relationType
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

// Builds the host-relation filter for a relation field rendered as a record
// table on a record page, so the table stays scoped to the current record's
// related records even when a view supplies its columns. Mirrors the relation
// filter used for aggregates in RecordDetailRelationSection.
// Returns undefined for to-one relations (no host foreign key to filter on) or
// when the inverse relation field name cannot be resolved.
export const getRelationTableFilter = ({
  recordId,
  relationType,
  inverseRelationFieldMetadataItem,
  recordObjectMetadataNameSingular,
  recordObjectMetadataNamePlural,
}: GetRelationTableFilterArgs): RecordGqlOperationFilter | undefined => {
  const isToManyRelation = relationType === RelationType.ONE_TO_MANY;

  if (!isToManyRelation || !isDefined(inverseRelationFieldMetadataItem)) {
    return undefined;
  }

  const gqlFieldName = resolveInverseRelationGqlFieldName({
    inverseRelationFieldMetadataItem,
    recordObjectMetadataNameSingular,
    recordObjectMetadataNamePlural,
  });

  if (!isDefined(gqlFieldName)) {
    return undefined;
  }

  return {
    [`${gqlFieldName}Id`]: {
      in: [recordId],
    },
  } satisfies RecordGqlOperationFilter;
};
