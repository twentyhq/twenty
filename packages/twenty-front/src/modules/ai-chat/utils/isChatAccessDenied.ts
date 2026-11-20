import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';
import { isDefined } from 'twenty-shared/utils';

export const isChatAccessDenied = (
  errors:
    | readonly { extensions?: Readonly<Record<string, unknown>> }[]
    | undefined,
) =>
  isDefined(errors) &&
  errors.some(
    (error) =>
      isGraphqlErrorOfType(error, 'NOT_FOUND') ||
      isGraphqlErrorOfType(error, 'FORBIDDEN'),
  );
