import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

const TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIER_SET: ReadonlySet<string> = new Set(
  Object.values(TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS),
);

export const isTwentyPublicAppUniversalIdentifier = (
  universalIdentifier: string,
): boolean =>
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIER_SET.has(
    universalIdentifier.toLowerCase(),
  );
