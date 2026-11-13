import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'twenty-shared/application';

export const MARKETPLACE_FEATURED_APPLICATIONS: {
  universalIdentifier: string;
  sourcePackage: string;
  position?: number;
}[] = [
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CLAUDE,
    sourcePackage: '@twentyhq/claude',
    position: 1,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CHATGPT,
    sourcePackage: '@twentyhq/chatgpt',
    position: 2,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER,
    sourcePackage: '@twentyhq/call-recorder',
    position: 3,
  },
  {
    universalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.PEOPLE_DATA_LABS,
    sourcePackage: '@twentyhq/people-data-labs',
    position: 4,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT,
    sourcePackage: '@twentyhq/last-contact',
    position: 5,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.EXA,
    sourcePackage: '@twentyhq/exa',
    position: 6,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
    sourcePackage: '@twentyhq/slack',
    position: 7,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.TEAMS,
    sourcePackage: '@twentyhq/teams',
    position: 8,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.FATHOM,
    sourcePackage: '@twentyhq/fathom',
    position: 9,
  },
];
