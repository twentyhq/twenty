import { TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS } from 'src/engine/core-modules/application/application-marketplace/constants/twenty-public-app-universal-identifiers.constant';

export const MARKETPLACE_VETTED_APPLICATIONS: {
  universalIdentifier: string;
  position?: number;
}[] = [
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER,
    position: 1,
  },
  {
    universalIdentifier:
      TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.PEOPLE_DATA_LABS,
    position: 2,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT,
    position: 3,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.EXA,
    position: 4,
  },
  {
    universalIdentifier: TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK,
    position: 5,
  },
];
