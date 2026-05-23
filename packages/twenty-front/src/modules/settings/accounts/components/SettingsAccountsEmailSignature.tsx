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
import {
  type UpdateConnectedAccountSignatureMutation,
  type UpdateConnectedAccountSignatureMutationVariables,
} from '~/generated-metadata/graphql';

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
  const [signatureFormState, setSignatureFormState] = useState(() => ({
    connectedAccountId: connectedAccount.id,
    editorKey: 0,
    emailSignature: connectedAccount.emailSignature ?? '',
  }));

  const [updateConnectedAccountSignature, { loading }] = useMutation<
    UpdateConnectedAccountSignatureMutation,
    UpdateConnectedAccountSignatureMutationVariables
  >(UPDATE_CONNECTED_ACCOUNT_SIGNATURE);

  useEffect(() => {
    const emailSignature = connectedAccount.emailSignature ?? '';

    setSignatureFormState((previousState) => {
      if (
        previousState.connectedAccountId === connectedAccount.id &&
        previousState.emailSignature === emailSignature
      ) {
        return previousState;
      }

      return {
        connectedAccountId: connectedAccount.id,
        editorKey: previousState.editorKey + 1,
        emailSignature,
      };
    });
  }, [connectedAccount.id, connectedAccount.emailSignature]);

  const handleSave = async () => {
    try {
      const result = await updateConnectedAccountSignature({
        variables: {
          input: {
            id: connectedAccount.id,
            emailSignature: signatureFormState.emailSignature.trim()
              ? signatureFormState.emailSignature
              : null,
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

  const isDirty =
    signatureFormState.emailSignature !==
    (connectedAccount.emailSignature ?? '');

  return (
    <Card rounded>
      <StyledCardContent>
        <FormAdvancedTextFieldInput
          key={signatureFormState.editorKey}
          defaultValue={signatureFormState.emailSignature}
          onChange={(emailSignature) => {
            setSignatureFormState((previousState) => ({
              ...previousState,
              emailSignature,
            }));
          }}
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
