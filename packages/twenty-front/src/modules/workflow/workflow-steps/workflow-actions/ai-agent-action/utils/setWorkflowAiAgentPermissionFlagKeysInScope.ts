import { type AiRunScope } from 'twenty-shared/ai';
import { SystemPermissionFlag } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';

export const setWorkflowAiAgentPermissionFlagKeysInScope = ({
  scope,
  permissionFlagKeys,
}: {
  scope: AiRunScope | undefined;
  permissionFlagKeys: string[];
}): AiRunScope => ({
  ...scope,
  permissionFlagUniversalIdentifiers: permissionFlagKeys
    .map(
      (permissionFlagKey) =>
        SystemPermissionFlag[
          permissionFlagKey as keyof typeof SystemPermissionFlag
        ],
    )
    .filter(isDefined),
});
