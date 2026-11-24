import { SettingsApplicationConnectionBillingValidationModal } from '@/settings/applications/components/SettingsApplicationConnectionBillingValidationModal';
import { useStartNewAppConnection } from '@/settings/applications/hooks/useStartNewAppConnection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type ApplicationConnectionProvider } from '~/generated-metadata/graphql';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAddConnectionButtonProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationConnectionProvider,
    'name' | 'type' | 'displayName' | 'logoUrl' | 'connectedAccountPrices'
  >;
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { startNewAppConnection } = useStartNewAppConnection({
    applicationId,
    connectionProvider,
    redirectLocation,
  });

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={startNewAppConnection}
        variant="outline"
      >{t`Add connection`}</Button>
      <SettingsApplicationConnectionBillingValidationModal
        applicationId={applicationId}
        connectionProvider={connectionProvider}
        redirectLocation={redirectLocation}
      />
    </StyledFooter>
  );
};
