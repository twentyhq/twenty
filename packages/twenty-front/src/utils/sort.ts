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
) => (fieldValueA === fieldValueB ? 0 : fieldValueA < fieldValueB ? -1 : 1);

export const sortDesc = (
  fieldValueA: string | number,
  fieldValueB: string | number,
) => sortAsc(fieldValueB, fieldValueA);
