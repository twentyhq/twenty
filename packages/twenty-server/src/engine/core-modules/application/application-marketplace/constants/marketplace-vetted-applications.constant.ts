import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/twenty-public-app-universal-identifiers.constant';

export const MARKETPLACE_VETTED_APPLICATIONS: {
  universalIdentifier: string;
  sourcePackage: string;
  position?: number;
}[] = [
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER,
    sourcePackage: '@twentyhq/call-recorder',
    position: 1,
  },
  {
    universalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.PEOPLE_DATA_LABS,
    sourcePackage: '@twentyhq/people-data-labs',
    position: 2,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT,
    sourcePackage: '@twentyhq/last-contact',
    position: 3,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.EXA,
    sourcePackage: '@twentyhq/exa',
    position: 4,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
    sourcePackage: '@twentyhq/slack',
    position: 5,
  },
  // Fork additions keep upstream ordering untouched and append after it, so a
  // future upstream insert cannot silently re-associate an identifier.
  {
    universalIdentifier: 'e003bed6-c04d-41b7-b09e-22bdd3397888', // Zalo OA
    sourcePackage: '@crove/zalo-oa',
    position: 6,
  },
  {
    universalIdentifier: 'a1b2c3d4-e5f6-4a1b-8c2d-3e4f5a6b7c8d', // Commerce
    sourcePackage: '@crove/commerce',
    position: 7,
  },
];
