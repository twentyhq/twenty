import { type PageLayoutFilterValue } from '~/generated-metadata/graphql';

// Sorted, since a URL lists range conditions in a fixed order that a stored default may not follow
const getConditionKeys = (value: PageLayoutFilterValue | null | undefined) =>
  (value?.conditions ?? [])
    .map(({ operand, value }) => `${operand}:${value}`)
    .sort();

export const isPageLayoutFilterValueEqual = ({
  firstValue,
  secondValue,
}: {
  firstValue: PageLayoutFilterValue | null | undefined;
  secondValue: PageLayoutFilterValue | null | undefined;
}): boolean => {
  const firstConditionKeys = getConditionKeys(firstValue);
  const secondConditionKeys = getConditionKeys(secondValue);

  return (
    firstConditionKeys.length === secondConditionKeys.length &&
    firstConditionKeys.every(
      (conditionKey, index) => conditionKey === secondConditionKeys[index],
    )
  );
};
