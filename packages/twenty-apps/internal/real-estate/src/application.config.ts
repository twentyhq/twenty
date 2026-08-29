import { defineApplication } from 'twenty-sdk/define';

export const APPLICATION_UNIVERSAL_IDENTIFIER =
  '0dc70098-ce83-430a-bb37-d5b5f2790b99';

export default defineApplication({
  universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
  displayName: 'Real Estate',
  description:
    'Demo real estate CRM: properties, showings, and buyer/seller/agent roles',
});
