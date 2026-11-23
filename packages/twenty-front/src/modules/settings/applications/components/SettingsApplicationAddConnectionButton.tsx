import { SettingsApplicationConnectionBillingValidationModal } from '@/settings/applications/components/SettingsApplicationConnectionBillingValidationModal';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { type ConnectedAccountPrice } from '@/settings/applications/types/ConnectedAccountPrice';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { IconPlus } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: ${themeCssVariables.spacing[2]};
`;

type SettingsApplicationAddConnectionButtonProps = {
  applicationId: string;
  connectionProvider: {
    name: string;
    type: string;
    displayName: string;
    logoUrl: string | null;
    connectedAccountPrices: ConnectedAccountPrice[];
  };
  redirectLocation?: string;
};

export const SettingsApplicationAddConnectionButton = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: SettingsApplicationAddConnectionButtonProps) => {
  const { t } = useLingui();
  const { startAppConnection } = useStartAppConnection();
  const { openDialog } = useDialog();

  const billingValidationModalInstanceId = `application-connection-billing-validation-${applicationId}-${connectionProvider.name}`;

  const startConnection = () =>
    startAppConnection({
      applicationId,
      connectionProviderName: connectionProvider.name,
      connectionProviderType: connectionProvider.type,
      redirectLocation,
    });

  const handleClick = () => {
    if (isNonEmptyArray(connectionProvider.connectedAccountPrices)) {
      openDialog(billingValidationModalInstanceId);

      return;
    }

    startConnection();
  };

  return (
    <StyledFooter>
      <Button
        startIcon={<IconPlus />}
        size="sm"
        onClick={handleClick}
        variant="outline"
      >{t`Add connection`}</Button>
      <SettingsApplicationConnectionBillingValidationModal
        modalInstanceId={billingValidationModalInstanceId}
        connectionProviderDisplayName={connectionProvider.displayName}
        connectionProviderLogoUrl={connectionProvider.logoUrl}
        connectedAccountPrices={connectionProvider.connectedAccountPrices}
        onAuthorize={startConnection}
      />
    </StyledFooter>
  );
};
