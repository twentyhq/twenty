import { AppChip } from '@/applications/components/AppChip';
import { type ApplicationWithPreferences } from '@/settings/app-preferences/types/ApplicationWithPreferences';
import { SettingsApplicationConnectionBillingValidationModal } from '@/settings/applications/components/SettingsApplicationConnectionBillingValidationModal';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { isNonEmptyArray } from 'twenty-shared/utils';

type SettingsApplicationConnectCardProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationWithPreferences['connectionProviders'][number],
    'name' | 'type' | 'displayName' | 'logoUrl' | 'connectedAccountPrices'
  >;
  title: string;
  redirectLocation: string;
};

export const SettingsApplicationConnectCard = ({
  applicationId,
  connectionProvider,
  title,
  redirectLocation,
}: SettingsApplicationConnectCardProps) => {
  const { startAppConnection } = useStartAppConnection();
  const { openDialog } = useDialog();

  const billingValidationModalInstanceId = `application-connect-card-billing-validation-${applicationId}-${connectionProvider.name}`;

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
    <>
      <SettingsCard
        Icon={
          <AppChip
            applicationId={applicationId}
            logoUrl={connectionProvider.logoUrl}
            size="md"
            chipOnly
          />
        }
        title={title}
        onClick={handleClick}
      />
      <SettingsApplicationConnectionBillingValidationModal
        modalInstanceId={billingValidationModalInstanceId}
        connectionProviderDisplayName={connectionProvider.displayName}
        connectionProviderLogoUrl={connectionProvider.logoUrl}
        connectedAccountPrices={connectionProvider.connectedAccountPrices}
        onAuthorize={startConnection}
      />
    </>
  );
};
