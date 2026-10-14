import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type FindNewerRecord = (params: {
  cacheId: string;
  updatedAt: string;
}) => ObjectRecord | undefined;

const isGraphqlObject = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value) && isNonEmptyString(value.__typename);

const isRelationValue = (value: unknown) =>
  (isGraphqlObject(value) && (isDefined(value.id) || isDefined(value.edges))) ||
  (Array.isArray(value) && value.some(isGraphqlObject));

const isForeignKeyOfSelectedRelation = ({
  node,
  fieldName,
}: {
  node: Record<string, unknown>;
  fieldName: string;
}) => fieldName.endsWith('Id') && fieldName.slice(0, -'Id'.length) in node;

const patchFieldsWithNewerRecord = ({
  node,
  newerRecord,
}: {
  node: Record<string, unknown>;
  newerRecord: ObjectRecord;
}) => {
  const patchedNode: Record<string, unknown> = { ...node };

  for (const [fieldName, responseValue] of Object.entries(node)) {
    if (
      fieldName === '__typename' ||
      fieldName === 'id' ||
      !(fieldName in newerRecord) ||
      isForeignKeyOfSelectedRelation({ node, fieldName })
    ) {
      continue;
    }

    const newerValue: unknown = newerRecord[fieldName];

    if (
      isRelationValue(responseValue) ||
      (isPlainObject(newerValue) && isDefined(newerValue.id))
    ) {
      continue;
    }

    if (isGraphqlObject(responseValue)) {
      if (isPlainObject(newerValue)) {
        patchedNode[fieldName] = Object.fromEntries(
          Object.entries(responseValue).map(([subFieldName, subFieldValue]) => [
            subFieldName,
            subFieldName in newerValue
              ? newerValue[subFieldName]
              : subFieldValue,
          ]),
        );
      }

      continue;
    }

    patchedNode[fieldName] = newerValue;
  }

  return patchedNode;
};

const patchNestedValues = ({
  node,
  findNewerRecord,
}: {
  node: Record<string, unknown>;
  findNewerRecord: FindNewerRecord;
}) => {
  let patchedNode = node;

  for (const [fieldName, fieldValue] of Object.entries(node)) {
    const patchedFieldValue = patchValue({
      value: fieldValue,
      findNewerRecord,
    });

    if (patchedFieldValue === fieldValue) {
      continue;
    }

    if (patchedNode === node) {
      patchedNode = { ...node };
    }

    patchedNode[fieldName] = patchedFieldValue;
  }

  return patchedNode;
};

const patchValue = ({
  value,
  findNewerRecord,
}: {
  value: unknown;
  findNewerRecord: FindNewerRecord;
}): unknown => {
  if (Array.isArray(value)) {
    const patchedItems = value.map((item) =>
      patchValue({ value: item, findNewerRecord }),
    );

    return patchedItems.some((item, index) => item !== value[index])
      ? patchedItems
      : value;
  }

  if (!isGraphqlObject(value)) {
    return value;
  }

  const newerRecord =
    isNonEmptyString(value.id) && isNonEmptyString(value.updatedAt)
      ? findNewerRecord({
          cacheId: `${value.__typename}:${value.id}`,
          updatedAt: value.updatedAt,
        })
      : undefined;

  return patchNestedValues({
    node: isDefined(newerRecord)
      ? patchFieldsWithNewerRecord({ node: value, newerRecord })
      : value,
    findNewerRecord,
  });
};

export const patchStaleRecordNodes = ({
  data,
  findNewerRecord,
}: {
  data: Record<string, unknown>;
  findNewerRecord: FindNewerRecord;
}) => patchNestedValues({ node: data, findNewerRecord });
