import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

export const buildApplicationIdentifierWhereOrThrow = ({
  id,
  universalIdentifier,
}: {
  id?: string;
  universalIdentifier?: string;
}): { id: string } | { universalIdentifier: string } => {
  if (isDefined(id)) {
    return { id };
  }

  if (isDefined(universalIdentifier)) {
    return { universalIdentifier };
  }

  throw new ApplicationException(
    `Either id or universalIdentifier must be provided to find application.`,
    ApplicationExceptionCode.APPLICATION_NOT_FOUND,
  );
};
