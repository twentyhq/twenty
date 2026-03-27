import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type RecordGqlFields } from '@/object-record/graphql/record-gql-fields/types/RecordGqlFields';
import { isDefined } from 'twenty-shared/utils';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type RelationExportFieldMetadataItem = Pick<
  FieldMetadataItem,
  'isActive' | 'isSystem' | 'label' | 'name' | 'relation' | 'type'
>;

type RelationExportObjectMetadataItem = Pick<
  EnrichedObjectMetadataItem,
  'fields' | 'id' | 'nameSingular'
>;

export type ExportableRelationFieldPath = {
  fieldPath: string;
  fieldLabel: string;
  fieldType: FieldMetadataType;
};

const EXCLUDED_FIELD_NAMES = new Set([
  'createdAt',
  'updatedAt',
  'deletedAt',
  'position',
]);

const EXPORTABLE_FIELD_TYPES = new Set([
  FieldMetadataType.TEXT,
  FieldMetadataType.NUMBER,
  FieldMetadataType.DATE_TIME,
  FieldMetadataType.DATE,
  FieldMetadataType.BOOLEAN,
  FieldMetadataType.PHONES,
  FieldMetadataType.EMAILS,
  FieldMetadataType.FULL_NAME,
  FieldMetadataType.ADDRESS,
  FieldMetadataType.CURRENCY,
  FieldMetadataType.LINKS,
  FieldMetadataType.SELECT,
  FieldMetadataType.MULTI_SELECT,
  FieldMetadataType.RATING,
  FieldMetadataType.UUID,
]);

const getObjectMetadataKey = (
  objectMetadataItem: RelationExportObjectMetadataItem,
) => objectMetadataItem.id ?? objectMetadataItem.nameSingular;

const shouldSkipField = (field: RelationExportFieldMetadataItem) =>
  field.isActive === false ||
  (field.isSystem === true && field.name !== 'id') ||
  EXCLUDED_FIELD_NAMES.has(field.name);

const isExportableLeafField = (field: RelationExportFieldMetadataItem) => {
  if (shouldSkipField(field)) {
    return false;
  }

  if (field.type === FieldMetadataType.RELATION) {
    return false;
  }

  if (field.type === FieldMetadataType.ACTOR) {
    return false;
  }

  if (field.type === FieldMetadataType.RICH_TEXT) {
    return false;
  }

  if (field.type === FieldMetadataType.FILES) {
    return false;
  }

  return EXPORTABLE_FIELD_TYPES.has(field.type as FieldMetadataType);
};

export const buildExportableRelationFieldPaths = ({
  objectMetadataItem,
  objectMetadataItems,
  parentFieldLabels = [],
  parentFieldNames = [],
  visitedObjectMetadataKeys = new Set<string>(),
}: {
  objectMetadataItem: RelationExportObjectMetadataItem;
  objectMetadataItems: RelationExportObjectMetadataItem[];
  parentFieldLabels?: string[];
  parentFieldNames?: string[];
  visitedObjectMetadataKeys?: Set<string>;
}): ExportableRelationFieldPath[] => {
  const nextVisitedObjectMetadataKeys = new Set(visitedObjectMetadataKeys);
  nextVisitedObjectMetadataKeys.add(getObjectMetadataKey(objectMetadataItem));

  return objectMetadataItem.fields.flatMap((field) => {
    if (shouldSkipField(field)) {
      return [];
    }

    if (
      field.type === FieldMetadataType.RELATION &&
      field.relation?.type === RelationType.MANY_TO_ONE
    ) {
      const targetObjectNameSingular =
        field.relation?.targetObjectMetadata?.nameSingular;

      if (!isDefined(targetObjectNameSingular)) {
        return [];
      }

      const targetObjectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === targetObjectNameSingular,
      );

      if (!isDefined(targetObjectMetadataItem)) {
        return [];
      }

      const targetObjectMetadataKey = getObjectMetadataKey(
        targetObjectMetadataItem,
      );

      if (nextVisitedObjectMetadataKeys.has(targetObjectMetadataKey)) {
        return [];
      }

      return buildExportableRelationFieldPaths({
        objectMetadataItem: targetObjectMetadataItem,
        objectMetadataItems,
        parentFieldLabels: [...parentFieldLabels, field.label ?? field.name],
        parentFieldNames: [...parentFieldNames, field.name],
        visitedObjectMetadataKeys: nextVisitedObjectMetadataKeys,
      });
    }

    if (!isExportableLeafField(field)) {
      return [];
    }

    return [
      {
        fieldPath: [...parentFieldNames, field.name].join('.'),
        fieldLabel: [...parentFieldLabels, field.label ?? field.name].join(
          ' / ',
        ),
        fieldType: field.type as FieldMetadataType,
      },
    ];
  });
};

export const buildRecordGqlFieldsFromSelectedFieldPaths = (
  selectedFieldPaths: string[],
): RecordGqlFields => {
  const recordGqlFields: RecordGqlFields = { id: true };

  for (const selectedFieldPath of selectedFieldPaths) {
    const pathSegments = selectedFieldPath
      .split('.')
      .filter((segment) => segment.length > 0);

    if (pathSegments.length === 0) {
      continue;
    }

    let currentNode = recordGqlFields;

    for (const [index, pathSegment] of pathSegments.entries()) {
      const isLeaf = index === pathSegments.length - 1;

      if (isLeaf) {
        currentNode[pathSegment] = true;
        continue;
      }

      const currentValue = currentNode[pathSegment];

      if (!isDefined(currentValue) || currentValue === true) {
        currentNode[pathSegment] = {};
      }

      currentNode = currentNode[pathSegment] as RecordGqlFields;
    }
  }

  return recordGqlFields;
};

export const getRelationFieldFlatKey = (
  relationFieldName: string,
  fieldPath: string,
) => `${relationFieldName}__${fieldPath.split('.').join('__')}`;

export const getRelationFieldValueFromPath = (
  record: Record<string, unknown> | undefined,
  fieldPath: string,
): unknown => {
  const pathSegments = fieldPath.split('.').filter((segment) => segment !== '');

  return pathSegments.reduce<unknown>((value, pathSegment) => {
    if (!isDefined(value) || typeof value !== 'object') {
      return undefined;
    }

    return (value as Record<string, unknown>)[pathSegment];
  }, record);
};
