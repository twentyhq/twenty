import { defineApplicationRole } from 'twenty-sdk/define';
import { DEFAULT_ROLE_ID } from 'src/constants/universal-identifiers';

export default defineApplicationRole({
  universalIdentifier: DEFAULT_ROLE_ID,
  label: 'Default function role',
  permissionSets: [
    {
      objectUniversalIdentifiers: ['*'],
      permissionFlagUniversalIdentifiers: ['*'],
    },
  ],
});
