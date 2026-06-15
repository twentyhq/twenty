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
  // record's object — its name + "Id" is the foreign key to filter on.
  relationFieldMetadataItem: FieldMetadataItem | undefined;
  // The record's own object names, needed only to resolve the gql field name of
  // a morph relation.
  targetObjectMetadataNameSingular: string | undefined;
  targetObjectMetadataNamePlural: string | undefined;
};

const resolveInverseRelationGqlFieldName = ({
  relationFieldMetadataItem,
  targetObjectMetadataNameSingular,
  targetObjectMetadataNamePlural,
}: {
  relationFieldMetadataItem: FieldMetadataItem;
  targetObjectMetadataNameSingular: string | undefined;
  targetObjectMetadataNamePlural: string | undefined;
}): string | undefined => {
  if (relationFieldMetadataItem.type !== FieldMetadataType.MORPH_RELATION) {
    return relationFieldMetadataItem.name;
  }

  const settings = relationFieldMetadataItem.settings;
  const morphRelationType =
    isDefined(settings) && 'relationType' in settings
      ? settings.relationType
      : undefined;

  if (
    !isDefined(morphRelationType) ||
    !isDefined(targetObjectMetadataNameSingular) ||
    !isDefined(targetObjectMetadataNamePlural)
  ) {
    return undefined;
  }

  return computeMorphRelationGqlFieldName({
    fieldName: relationFieldMetadataItem.name,
    relationType: morphRelationType,
    targetObjectMetadataNameSingular,
    targetObjectMetadataNamePlural,
  });
};

/**
 * Builds the host-relation filter for a relation field rendered as a record
 * table on a record page, so the table stays scoped to the current record's
 * related records even when a view supplies its columns.
 *
 * Mirrors the relation filter used for aggregates in RecordDetailRelationSection:
 *   { `${inverseRelationFieldName}Id`: { in: [recordId] } }
 *
 * Returns undefined for to-one relations (no host foreign key to filter on) or
 * when the inverse relation field name cannot be resolved.
 */
export const getRelationTableFilter = ({
  recordId,
  relationType,
  relationFieldMetadataItem,
  targetObjectMetadataNameSingular,
  targetObjectMetadataNamePlural,
}: GetRelationTableFilterArgs): RecordGqlOperationFilter | undefined => {
  const isToManyRelation = relationType === RelationType.ONE_TO_MANY;

  if (!isToManyRelation || !isDefined(relationFieldMetadataItem)) {
    return undefined;
  }

  const gqlFieldName = resolveInverseRelationGqlFieldName({
    relationFieldMetadataItem,
    targetObjectMetadataNameSingular,
    targetObjectMetadataNamePlural,
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
