import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { Button, Field, Input } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { connectApplicationWithApiKeyTargetComponentState } from '@/side-panel/pages/connect-application-with-api-key/states/connectApplicationWithApiKeyTargetComponentState';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { ConnectApplicationWithApiKeyDocument } from '~/generated-metadata/graphql';
import { getErrorMessageFromApolloError } from '~/utils/get-error-message-from-apollo-error.util';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]} ${themeCssVariables.spacing[3]};
`;

export const SidePanelConnectApplicationWithApiKeyPage = () => {
  const { t } = useLingui();
  const connectApplicationWithApiKeyTarget = useAtomComponentStateValue(
    connectApplicationWithApiKeyTargetComponentState,
  );
  const { goBackFromSidePanel } = useSidePanelHistory();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { enqueueToast } = useToast();
  const [apiKey, setApiKey] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [connectApplicationWithApiKey, { loading }] = useMutation(
    ConnectApplicationWithApiKeyDocument,
  );

  const canConnect = isNonEmptyString(apiKey.trim()) && !loading;

  const handleConnect = async () => {
    if (!isDefined(connectApplicationWithApiKeyTarget) || !canConnect) {
      return;
    }

    setErrorMessage(null);

    try {
      await connectApplicationWithApiKey({
        variables: {
          input: {
            applicationId: connectApplicationWithApiKeyTarget.applicationId,
            providerName: connectApplicationWithApiKeyTarget.providerName,
            apiKey,
            reconnectingConnectedAccountId:
              connectApplicationWithApiKeyTarget.reconnectingConnectedAccountId,
          },
        },
        // By name so only mounted lists refetch: the workspace list needs a permission the member may lack
        refetchQueries: ['MyConnectedAccounts', 'ApplicationConnectedAccounts'],
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? getErrorMessageFromApolloError(error)
          : t`An error occurred.`,
      );

      return;
    }

    enqueueToast({
      status: 'success',
      children: t`${connectApplicationWithApiKeyTarget.providerDisplayName} connected`,
    });
    closeSidePanelMenu();
  };

  useHotkeysOnFocusedElement({
    keys: ['ctrl+Enter,meta+Enter'],
    callback: handleConnect,
    focusId: SIDE_PANEL_FOCUS_ID,
    dependencies: [handleConnect],
  });

  if (!isDefined(connectApplicationWithApiKeyTarget)) {
    return null;
  }

  return (
    <StyledContainer>
      <StyledContent>
        <Field.Root invalid={isDefined(errorMessage)}>
          <Field.Label>{t`API key`}</Field.Label>
          <Input
            type="password"
            autoComplete="off"
            autoFocus
            value={apiKey}
            onValueChange={(value) => {
              setApiKey(value);
              setErrorMessage(null);
            }}
          />
          {isDefined(errorMessage) ? (
            <Field.Error match>{errorMessage}</Field.Error>
          ) : (
            <Field.Description>{t`Paste a key from your ${connectApplicationWithApiKeyTarget.providerDisplayName} settings. It is stored encrypted.`}</Field.Description>
          )}
        </Field.Root>
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            variant="outline"
            onClick={goBackFromSidePanel}
          >{t`Cancel`}</Button>,
          <Button
            key="connect"
            size="sm"
            shortcut={['Mod', 'Enter']}
            disabled={!canConnect}
            onClick={handleConnect}
            variant="solid"
            color="accent"
          >{t`Connect`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
