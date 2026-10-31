import { type AiRunScope } from 'twenty-shared/ai';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

const UNIVERSAL_IDENTIFIER_BY_PERMISSION_FLAG_KEY = new Map<string, string>(
  Object.entries(SystemPermissionFlag),
);

// keys come from the tab's own flag lists, so one without a system flag has nothing to store
export const setWorkflowAiAgentPermissionFlagKeysInScope = ({
  scope,
  permissionFlagKeys,
}: {
  scope: AiRunScope | undefined;
  permissionFlagKeys: string[];
}): AiRunScope => ({
  ...scope,
  permissionFlagUniversalIdentifiers: permissionFlagKeys
    .map((permissionFlagKey) =>
      UNIVERSAL_IDENTIFIER_BY_PERMISSION_FLAG_KEY.get(permissionFlagKey),
    )
    .filter(isDefined),
});
