import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { buildIdentifierGqlFields } from '@/object-record/graphql/record-gql-fields/utils/buildIdentifierGqlFields';
import {
  getJunctionConfig,
  type JunctionObjectMetadataItem,
} from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { FieldMetadataType } from 'twenty-shared/types';
import { computeMorphRelationFieldName, isDefined } from 'twenty-shared/utils';

type JunctionFieldMetadataItem = Pick<
  FieldMetadataItem,
  'id' | 'name' | 'type' | 'settings' | 'morphRelations' | 'relation'
>;

type GenerateJunctionRelationGqlFieldsArgs = {
  fieldMetadataItem: JunctionFieldMetadataItem;
  objectMetadataItems: JunctionObjectMetadataItem[];
  isFilesFieldMigrated?: boolean;
};

const buildRegularTargetFieldGqlFields = (
  targetField: JunctionFieldMetadataItem,
  objectMetadataItems: JunctionObjectMetadataItem[],
  isFilesFieldMigrated?: boolean,
): RecordGqlFields => {
  const targetObjectMetadata = objectMetadataItems.find(
    (item) => item.id === targetField.relation?.targetObjectMetadata.id,
  );

  if (!isDefined(targetObjectMetadata)) {
    return {};
  }

  return {
    [targetField.name]: buildIdentifierGqlFields(
      targetObjectMetadata,
      isFilesFieldMigrated,
    ),
  };
};

const buildMorphTargetFieldGqlFields = (
  targetField: JunctionFieldMetadataItem,
  objectMetadataItems: JunctionObjectMetadataItem[],
  isFilesFieldMigrated?: boolean,
): RecordGqlFields => {
  const morphRelations = targetField.morphRelations;

  if (!Array.isArray(morphRelations) || morphRelations.length === 0) {
    return {};
  }

  const result: RecordGqlFields = {};

  for (const morphRelation of morphRelations) {
    const targetObjectMetadata = objectMetadataItems.find(
      (item) => item.id === morphRelation.targetObjectMetadata.id,
    );

    if (!isDefined(targetObjectMetadata)) {
      continue;
    }

    const computedFieldName = computeMorphRelationFieldName({
      fieldName: morphRelation.sourceFieldMetadata.name,
      relationType: morphRelation.type,
      targetObjectMetadataNameSingular: targetObjectMetadata.nameSingular,
      targetObjectMetadataNamePlural: targetObjectMetadata.namePlural,
    });

    result[computedFieldName] = buildIdentifierGqlFields(
      targetObjectMetadata,
      isFilesFieldMigrated,
    );
  }

  return result;
};

const buildTargetFieldGqlFields = (
  targetField: JunctionFieldMetadataItem,
  objectMetadataItems: JunctionObjectMetadataItem[],
  isFilesFieldMigrated?: boolean,
): RecordGqlFields => {
  if (targetField.type === FieldMetadataType.MORPH_RELATION) {
    return buildMorphTargetFieldGqlFields(
      targetField,
      objectMetadataItems,
      isFilesFieldMigrated,
    );
  }
  return buildRegularTargetFieldGqlFields(
    targetField,
    objectMetadataItems,
    isFilesFieldMigrated,
  );
};

// Generates GraphQL fields for a junction relation, including the nested target objects
export const generateJunctionRelationGqlFields = ({
  fieldMetadataItem,
  objectMetadataItems,
  isFilesFieldMigrated,
}: GenerateJunctionRelationGqlFieldsArgs): RecordGqlFields | null => {
  const junctionConfig = getJunctionConfig({
    settings: fieldMetadataItem.settings,
    relationObjectMetadataId:
      fieldMetadataItem.relation?.targetObjectMetadata.id ?? '',
    objectMetadataItems,
  });

  if (!isDefined(junctionConfig)) {
    return null;
  }

  const { junctionObjectMetadata, targetFields } = junctionConfig;

  const junctionTargetFields = targetFields.reduce<RecordGqlFields>(
    (acc, targetField) => ({
      ...acc,
      ...buildTargetFieldGqlFields(
        targetField,
        objectMetadataItems,
        isFilesFieldMigrated,
      ),
    }),
    {},
  );

  return {
    ...buildIdentifierGqlFields(junctionObjectMetadata, isFilesFieldMigrated),
    ...junctionTargetFields,
  };
};
