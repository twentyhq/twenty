import { defineApplication } from 'twenty-sdk';
import { DEFAULT_ROLE_UNIVERSAL_IDENTIFIER } from 'src/roles/default-role';
import { POST_INSTALL_UNIVERSAL_IDENTIFIER } from 'src/logic-functions/post-install';

export default defineApplication({
  universalIdentifier: '0fac8de4-9d11-492b-9e6a-577e11e1c442',
  displayName: 'Twenty for Twenty',
  description: '',
  defaultRoleUniversalIdentifier: DEFAULT_ROLE_UNIVERSAL_IDENTIFIER,
  postInstallLogicFunctionUniversalIdentifier: POST_INSTALL_UNIVERSAL_IDENTIFIER,
});
