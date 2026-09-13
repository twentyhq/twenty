import { isDefined } from 'twenty-shared/utils';

export const getApplicationMismatchMessage = ({
  requestedUniversalIdentifier,
  localApplicationUniversalIdentifier,
  hasLocalApplicationFile,
}: {
  requestedUniversalIdentifier: string | undefined;
  localApplicationUniversalIdentifier: string | null | undefined;
  hasLocalApplicationFile: boolean;
}): string | undefined => {
  if (!isDefined(requestedUniversalIdentifier) || !hasLocalApplicationFile) {
    return undefined;
  }

  if (!isDefined(localApplicationUniversalIdentifier)) {
    return (
      'This project declares an application, but its identifier could not be read.\n\n' +
      `  Pulling ${requestedUniversalIdentifier} here could overwrite that declaration.\n` +
      '  Run `yarn install` so the file can be evaluated, then pull again.'
    );
  }

  if (requestedUniversalIdentifier === localApplicationUniversalIdentifier) {
    return undefined;
  }

  return (
    `This project already defines application ${localApplicationUniversalIdentifier}.\n\n` +
    `  Pulling ${requestedUniversalIdentifier} here would leave two applications in one tree.\n` +
    '  Pull it into a different directory instead.'
  );
};
