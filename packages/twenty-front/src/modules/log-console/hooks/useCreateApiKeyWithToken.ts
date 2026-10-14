import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { apiKeyTokenFamilyState } from '@/settings/developers/states/apiKeyTokenFamilyState';
import {
  CreateApiKeyDocument,
  GenerateApiKeyTokenDocument,
  GetApiKeysDocument,
} from '~/generated-metadata/graphql';

type CreateApiKeyWithTokenArgs = {
  name: string;
  expiresAt: string;
  roleId: string;
};

export const useCreateApiKeyWithToken = () => {
  const jotaiStore = useStore();
  const [createApiKey] = useMutation(CreateApiKeyDocument, {
    refetchQueries: [GetApiKeysDocument],
  });
  const [generateApiKeyToken] = useMutation(GenerateApiKeyTokenDocument);

  const createApiKeyWithToken = async ({
    name,
    expiresAt,
    roleId,
  }: CreateApiKeyWithTokenArgs) => {
    const { data } = await createApiKey({
      variables: { input: { name, expiresAt, roleId } },
    });
    const apiKey = data?.createApiKey;

    if (!isDefined(apiKey)) {
      return undefined;
    }

    const { data: tokenData } = await generateApiKeyToken({
      variables: { apiKeyId: apiKey.id, expiresAt: apiKey.expiresAt },
    });
    const token = tokenData?.generateApiKeyToken.token;

    if (!isDefined(token)) {
      return undefined;
    }

    jotaiStore.set(apiKeyTokenFamilyState.atomFamily(apiKey.id), token);

    return apiKey.id;
  };

  return { createApiKeyWithToken };
};
