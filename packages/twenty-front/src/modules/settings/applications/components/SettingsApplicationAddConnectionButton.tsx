import { SettingsApplicationConnectionBillingValidationModal } from '@/settings/applications/components/SettingsApplicationConnectionBillingValidationModal';
import { useStartNewAppConnection } from '@/settings/applications/hooks/useStartNewAppConnection';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAddConnectionButtonProps = {
  applicationId: string;
  connectionProviderName: string;
  connectionProviderType: string;
  connectionProviderDisplayName: string;
  connectionProviderLogoUrl: string | null;
  connectedAccountPrices: ApplicationBillingPrice[];
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  connectionProviderName,
  connectionProviderType,
  connectionProviderDisplayName,
  connectionProviderLogoUrl,
  connectedAccountPrices,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { startNewAppConnection } = useStartNewAppConnection({
    applicationId,
    connectionProviderName,
    connectionProviderType,
    connectedAccountPrices,
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
        connectionProviderName={connectionProviderName}
        connectionProviderType={connectionProviderType}
        connectionProviderDisplayName={connectionProviderDisplayName}
        connectionProviderLogoUrl={connectionProviderLogoUrl}
        connectedAccountPrices={connectedAccountPrices}
        redirectLocation={redirectLocation}
      />
    </StyledFooter>
  );
};
