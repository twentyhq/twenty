import styled from '@emotion/styled';
import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { isDefined } from 'twenty-shared/utils';
import { useUpdateApiKeyMutation } from '~/generated-metadata/graphql';

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

type ApiKeyNameInputProps = {
  apiKeyName: string;
  apiKeyId: string;
  disabled: boolean;
  onNameUpdate?: (name: string) => void;
};

export const ApiKeyNameInput = ({
  apiKeyName,
  apiKeyId,
  disabled,
  onNameUpdate,
}: ApiKeyNameInputProps) => {
  const [updateApiKey] = useUpdateApiKeyMutation();

  // TODO: Enhance this with react-web-hook-form (https://www.react-hook-form.com)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const debouncedUpdate = useCallback(
    useDebouncedCallback(async (name: string) => {
      if (isDefined(onNameUpdate)) {
        onNameUpdate(apiKeyName);
      }
      if (!apiKeyName) {
        return;
      }
      const { data: updatedApiKeyData } = await updateApiKey({
        variables: {
          input: {
            id: apiKeyId,
            name,
          },
        },
      });
      const updatedApiKey = updatedApiKeyData?.updateApiKey;
      if (isDefined(updatedApiKey)) {
        onNameUpdate?.(updatedApiKey.name);
      }
    }, 500),
    [updateApiKey, onNameUpdate],
  );

  useEffect(() => {
    debouncedUpdate(apiKeyName);
    return debouncedUpdate.cancel;
  }, [debouncedUpdate, apiKeyName]);

  const nameTextInputId = `${apiKeyId}-name`;

  return (
    <StyledComboInputContainer>
      <SettingsTextInput
        instanceId={nameTextInputId}
        placeholder="E.g. backoffice integration"
        onChange={onNameUpdate}
        fullWidth
        value={apiKeyName}
        disabled={disabled}
      />
    </StyledComboInputContainer>
  );
};
