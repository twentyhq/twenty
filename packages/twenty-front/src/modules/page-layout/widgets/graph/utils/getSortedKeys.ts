import { GraphOrderBy } from '~/generated/graphql';

export const getSortedKeys = ({
  orderByY,
  yValues,
}: {
  orderByY?: GraphOrderBy | null;
  yValues: string[];
}) => {
  switch (orderByY) {
    case GraphOrderBy.FIELD_ASC:
      return Array.from(yValues).sort((a, b) => a.localeCompare(b));
    case GraphOrderBy.FIELD_DESC:
      return Array.from(yValues).sort((a, b) => b.localeCompare(a));
    default:
      return Array.from(yValues);
  }
};
