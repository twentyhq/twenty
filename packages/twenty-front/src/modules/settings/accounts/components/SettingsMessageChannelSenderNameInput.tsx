import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { UPDATE_MESSAGE_CHANNEL } from '@/settings/accounts/graphql/mutations/updateMessageChannel';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { IconCheck } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRow = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledInputContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

type SettingsMessageChannelSenderNameInputProps = {
  messageChannelId: string;
  value: string | null | undefined;
  placeholder: string;
};

export const SettingsMessageChannelSenderNameInput = ({
  messageChannelId,
  value,
  placeholder,
}: SettingsMessageChannelSenderNameInputProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [draftValue, setDraftValue] = useState(value ?? '');
  const [updateMessageChannel, { loading }] = useMutation(
    UPDATE_MESSAGE_CHANNEL,
  );

  const isSavable =
    draftValue.trim().length >= 1 && draftValue.trim() !== (value ?? '');

  const handleSave = async () => {
    try {
      await updateMessageChannel({
        variables: {
          input: {
            id: messageChannelId,
            update: { displayName: draftValue.trim() },
          },
        },
      });
      enqueueSuccessSnackBar({ message: t`Sender name saved` });
    } catch (error) {
      enqueueErrorSnackBar({
        ...(CombinedGraphQLErrors.is(error) ? { apolloError: error } : {}),
      });
    }
  };

  return (
    <StyledRow>
      <StyledInputContainer>
        <SettingsTextInput
          instanceId="message-channel-sender-name"
          value={draftValue}
          onChange={setDraftValue}
          placeholder={placeholder}
          fullWidth
        />
      </StyledInputContainer>
      <Button
        Icon={IconCheck}
        title={t`Save`}
        onClick={handleSave}
        isLoading={loading}
        disabled={!isSavable || loading}
      />
    </StyledRow>
  );
};
