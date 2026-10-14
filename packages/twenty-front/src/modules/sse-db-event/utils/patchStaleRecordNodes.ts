import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

type FindNewerRecord = (params: {
  cacheId: string;
  updatedAt: string | undefined;
}) => Record<string, unknown> | undefined;

const isGraphqlObject = (value: unknown): value is Record<string, unknown> =>
  isPlainObject(value) && isNonEmptyString(value.__typename);

const patchFieldsWithNewerRecord = ({
  node,
  newerRecord,
}: {
  node: Record<string, unknown>;
  newerRecord: Record<string, unknown>;
}) =>
  Object.fromEntries(
    Object.entries(node).map(([fieldName, responseValue]) => {
      if (fieldName === '__typename' || !(fieldName in newerRecord)) {
        return [fieldName, responseValue];
      }

      const newerValue = newerRecord[fieldName];

      if (isGraphqlObject(responseValue) && isPlainObject(newerValue)) {
        return [
          fieldName,
          Object.fromEntries(
            Object.entries(responseValue).map(
              ([subFieldName, subFieldValue]) => [
                subFieldName,
                subFieldName in newerValue
                  ? newerValue[subFieldName]
                  : subFieldValue,
              ],
            ),
          ),
        ];
      }

      return [fieldName, newerValue];
    }),
  );

const patchNestedValues = ({
  node,
  findNewerRecord,
}: {
  node: Record<string, unknown>;
  findNewerRecord: FindNewerRecord;
}) => {
  const patchedEntries = Object.entries(node).map(
    ([fieldName, fieldValue]) =>
      [fieldName, patchValue({ value: fieldValue, findNewerRecord })] as const,
  );

  return patchedEntries.some(
    ([fieldName, patchedFieldValue]) => patchedFieldValue !== node[fieldName],
  )
    ? Object.fromEntries(patchedEntries)
    : node;
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

  const newerRecord = isNonEmptyString(value.id)
    ? findNewerRecord({
        cacheId: `${value.__typename}:${value.id}`,
        updatedAt: isNonEmptyString(value.updatedAt)
          ? value.updatedAt
          : undefined,
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
