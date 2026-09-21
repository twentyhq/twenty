import { isDefined } from 'twenty-shared/utils';

export const isChatAccessDenied = (
  errors:
    | readonly { extensions?: Readonly<Record<string, unknown>> }[]
    | undefined,
) =>
  isDefined(errors) &&
  errors.some((error) =>
    ['NOT_FOUND', 'FORBIDDEN'].includes(String(error.extensions?.code)),
  );
