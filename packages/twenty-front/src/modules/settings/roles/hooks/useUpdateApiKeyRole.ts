import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import {
  useAssignRoleToApiKeyMutation,
  type ApiKeyForRole,
} from '~/generated-metadata/graphql';

export const useUpdateApiKeyRole = (roleId: string) => {
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const setSettingsDraftRole = useSetAtomFamilyState(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const [assignRoleToApiKeyMutation] = useAssignRoleToApiKeyMutation();

  const updateApiKeyRoleDraftState = ({
    apiKey,
  }: {
    apiKey: ApiKeyForRole;
  }) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      apiKeys: [...settingsDraftRole.apiKeys, apiKey],
    });
  };

  const addApiKeyToRoleAndUpdateState = async ({
    apiKeyId,
  }: {
    apiKeyId: string;
  }) => {
    const { data } = await assignRoleToApiKeyMutation({
      variables: {
        apiKeyId,
        roleId,
      },
      awaitRefetchQueries: true,
      refetchQueries: ['GetRoles'],
    });

    return data?.assignRoleToApiKey;
  };

  const addApiKeysToRole = async ({
    roleId,
    apiKeyIds,
  }: {
    roleId: string;
    apiKeyIds: string[];
  }) => {
    await Promise.all(
      apiKeyIds.map((apiKeyId) =>
        assignRoleToApiKeyMutation({
          variables: {
            roleId,
            apiKeyId,
          },
        }),
      ),
    );
  };

  return {
    addApiKeyToRoleAndUpdateState,
    updateApiKeyRoleDraftState,
    addApiKeysToRole,
  };
};
