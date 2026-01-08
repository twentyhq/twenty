import { type Maybe } from '~/generated/graphql';

export const sortNullsFirst = (
  fieldValueA: Maybe<unknown>,
  fieldValueB: Maybe<unknown>,
) =>
  fieldValueA === null && fieldValueB === null
    ? 0
    : fieldValueA === null
      ? -1
      : fieldValueB === null
        ? 1
        : 0;

export const sortNullsLast = (
  fieldValueA: Maybe<unknown>,
  fieldValueB: Maybe<unknown>,
) => sortNullsFirst(fieldValueB, fieldValueA);

export const sortAsc = (
  fieldValueA: string | number,
  fieldValueB: string | number,
) => {
  // Case-insensitive comparison for strings
  const valueA =
    typeof fieldValueA === 'string' ? fieldValueA.toLowerCase() : fieldValueA;
  const valueB =
    typeof fieldValueB === 'string' ? fieldValueB.toLowerCase() : fieldValueB;

  return valueA === valueB ? 0 : valueA < valueB ? -1 : 1;
};

export const sortDesc = (
  fieldValueA: string | number,
  fieldValueB: string | number,
) => sortAsc(fieldValueB, fieldValueA);
