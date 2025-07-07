import styled from '@emotion/styled';
import { useCallback, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { ApiKey } from '@/settings/developers/types/api-key/ApiKey';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDefined } from 'twenty-shared/utils';

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
  const { updateOneRecord: updateApiKey } = useUpdateOneRecord<ApiKey>({
    objectNameSingular: CoreObjectNameSingular.ApiKey,
  });

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
      await updateApiKey({
        idToUpdate: apiKeyId,
        updateOneRecordInput: { name },
      });
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
      <TextInput
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
