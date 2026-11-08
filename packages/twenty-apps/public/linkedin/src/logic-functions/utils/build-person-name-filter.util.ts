import { escapeSqlLikePattern } from 'src/logic-functions/utils/escape-sql-like-pattern.util';

export const buildPersonNameFilter = ({
  firstName,
  lastName,
}: {
  firstName: string;
  lastName: string;
}) => ({
  name: {
    firstName: { ilike: escapeSqlLikePattern(firstName) },
    lastName: { ilike: escapeSqlLikePattern(lastName) },
  },
});
