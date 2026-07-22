import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { UpdateEmailingDomainSenderIdentityDocument } from '~/generated-metadata/graphql';
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

type SenderField = 'senderDisplayName';

type SettingsEmailingDomainSenderFieldInputProps = {
  emailingDomainId: string;
  field: SenderField;
  value: string | null | undefined;
  placeholder: string;
  successMessage: string;
  minimumLength: number;
};

export const SettingsEmailingDomainSenderFieldInput = ({
  emailingDomainId,
  field,
  value,
  placeholder,
  successMessage,
  minimumLength,
}: SettingsEmailingDomainSenderFieldInputProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [draftValue, setDraftValue] = useState(value ?? '');
  const [updateSenderIdentity, { loading }] = useMutation(
    UpdateEmailingDomainSenderIdentityDocument,
  );

  const isSavable =
    draftValue.trim().length >= minimumLength &&
    draftValue.trim() !== (value ?? '');

  const handleSave = async () => {
    try {
      await updateSenderIdentity({
        variables: {
          input: { emailingDomainId, [field]: draftValue.trim() },
        },
      });
      enqueueSuccessSnackBar({ message: successMessage });
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
          instanceId={`emailing-domain-${field}`}
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
