import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilState } from 'recoil';
import { useAssignRoleToApiKeyMutation } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';

export const useUpdateApiKeyRole = (roleId: string) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
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
