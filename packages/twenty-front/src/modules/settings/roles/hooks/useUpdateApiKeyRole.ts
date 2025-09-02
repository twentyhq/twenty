import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useRecoilState } from 'recoil';
import { useAssignRoleToApiKeyMutation } from '~/generated-metadata/graphql';
import { type ApiKeyForRole } from '~/generated/graphql';

type AddApiKeyToRoleAndUpdateStateParams = {
  apiKeyId: string;
};

type UpdateApiKeyRoleDraftStateParams = {
  apiKey: ApiKeyForRole;
};

export const useUpdateApiKeyRole = (roleId: string) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const [assignRoleToApiKeyMutation] = useAssignRoleToApiKeyMutation();

  const updateApiKeyRoleDraftState = ({
    apiKey,
  }: UpdateApiKeyRoleDraftStateParams) => {
    setSettingsDraftRole({
      ...settingsDraftRole,
      apiKeys: [...settingsDraftRole.apiKeys, apiKey],
    });
  };

  const addApiKeyToRoleAndUpdateState = async ({
    apiKeyId,
  }: AddApiKeyToRoleAndUpdateStateParams) => {
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

  return {
    addApiKeyToRoleAndUpdateState,
    updateApiKeyRoleDraftState,
  };
};
