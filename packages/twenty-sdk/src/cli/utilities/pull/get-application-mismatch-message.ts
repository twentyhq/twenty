import { isDefined } from 'twenty-shared/utils';

export const getApplicationMismatchMessage = ({
  requestedUniversalIdentifier,
  localApplicationUniversalIdentifier,
}: {
  requestedUniversalIdentifier: string | undefined;
  localApplicationUniversalIdentifier: string | null | undefined;
}): string | undefined => {
  if (
    !isDefined(requestedUniversalIdentifier) ||
    !isDefined(localApplicationUniversalIdentifier) ||
    requestedUniversalIdentifier === localApplicationUniversalIdentifier
  ) {
    return undefined;
  }

  return (
    `This project already defines application ${localApplicationUniversalIdentifier}.\n\n` +
    `  Pulling ${requestedUniversalIdentifier} here would leave two applications in one tree.\n` +
    '  Pull it into a different directory instead.'
  );
};
