import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { IconDeviceFloppy } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FormAdvancedTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormAdvancedTextFieldInput';
import { UPDATE_CONNECTED_ACCOUNT_SIGNATURE } from '@/settings/accounts/graphql/mutations/updateConnectedAccountSignature';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';
import { GET_MY_MESSAGE_CHANNELS } from '@/settings/accounts/graphql/queries/getMyMessageChannels';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

type SettingsAccountsEmailSignatureProps = {
  connectedAccount: {
    id: string;
    emailSignature: string | null;
  };
};

const StyledCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
`;

export const SettingsAccountsEmailSignature = ({
  connectedAccount,
}: SettingsAccountsEmailSignatureProps) => {
  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [emailSignature, setEmailSignature] = useState(
    connectedAccount.emailSignature ?? '',
  );
  const [editorKey, setEditorKey] = useState(0);

  const [updateConnectedAccountSignature, { loading }] = useMutation(
    UPDATE_CONNECTED_ACCOUNT_SIGNATURE,
  );

  useEffect(() => {
    setEmailSignature(connectedAccount.emailSignature ?? '');
    setEditorKey((previousKey) => previousKey + 1);
  }, [connectedAccount.id, connectedAccount.emailSignature]);

  const handleSave = async () => {
    try {
      const result = await updateConnectedAccountSignature({
        variables: {
          input: {
            id: connectedAccount.id,
            emailSignature: emailSignature.trim() ? emailSignature : null,
          },
        },
        refetchQueries: [GET_MY_CONNECTED_ACCOUNTS, GET_MY_MESSAGE_CHANNELS],
      });

      if (result.data?.updateConnectedAccountSignature?.id) {
        enqueueSuccessSnackBar({ message: t`Email signature saved` });
      }
    } catch {
      enqueueErrorSnackBar({ message: t`Failed to save email signature` });
    }
  };

  const isDirty = emailSignature !== (connectedAccount.emailSignature ?? '');

  return (
    <Card rounded>
      <StyledCardContent>
        <FormAdvancedTextFieldInput
          key={`${connectedAccount.id}-${editorKey}`}
          defaultValue={emailSignature}
          onChange={setEmailSignature}
          placeholder={t`Add your email signature`}
          minHeight={120}
          maxWidth={600}
          contentType="html"
        />
        <StyledFooter>
          <Button
            title={t`Save signature`}
            Icon={IconDeviceFloppy}
            accent="blue"
            size="small"
            variant="secondary"
            onClick={handleSave}
            disabled={!isDirty || loading}
          />
        </StyledFooter>
      </StyledCardContent>
    </Card>
  );
};
