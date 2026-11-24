import { AppConsentCard } from '@/applications/components/AppConsentCard';
import { AppConsentCardRow } from '@/applications/components/AppConsentCardRow';
import { AppConsentDialog } from '@/applications/components/AppConsentDialog';
import { useNumberFormat } from '@/localization/hooks/useNumberFormat';
import { getCurrencyPrefix } from '@/localization/utils/getCurrencyPrefix';
import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { getConnectionBillingValidationModalInstanceId } from '@/settings/applications/utils/getConnectionBillingValidationModalInstanceId';
import { useLingui } from '@lingui/react/macro';
import { IconCreditCard } from 'twenty-ui/icon';
import {
  type ApplicationBillingPrice,
  type ApplicationConnectionProvider,
} from '~/generated-metadata/graphql';

type SettingsApplicationConnectionBillingValidationModalProps = {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationConnectionProvider,
    'name' | 'type' | 'displayName' | 'logoUrl' | 'connectedAccountPrices'
  >;
  redirectLocation?: string;
};

export const SettingsApplicationConnectionBillingValidationModal = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: SettingsApplicationConnectionBillingValidationModalProps) => {
  const { t } = useLingui();
  const { startAppConnection } = useStartAppConnection();
  const { formatNumber } = useNumberFormat();

  const formatMonthlyPrice = ({
    amountCents,
    currency,
  }: Pick<ApplicationBillingPrice, 'amountCents' | 'currency'>) => {
    const amount = `${getCurrencyPrefix(currency)}${formatNumber(
      amountCents / 100,
      { decimals: 2, minimumDecimals: 2 },
    )}`;

    return t`${amount} / month`;
  };

  const handleAuthorize = () => {
    startAppConnection({
      applicationId,
      connectionProviderName: connectionProvider.name,
      connectionProviderType: connectionProvider.type,
      redirectLocation,
    });
  };

  return (
    <AppConsentDialog
      dialogId={getConnectionBillingValidationModalInstanceId({
        applicationId,
        connectionProviderName: connectionProvider.name,
      })}
      appName={connectionProvider.displayName}
      appLogoUrl={connectionProvider.logoUrl}
      title={t`Connect a ${connectionProvider.displayName} account`}
      onAuthorize={handleAuthorize}
    >
      <AppConsentCard
        title={t`This connection is added to your workspace subscription:`}
      >
        {connectionProvider.connectedAccountPrices.map((price) => {
          const formattedPrice = formatMonthlyPrice(price);

          return (
            <AppConsentCardRow
              key={price.universalIdentifier}
              Icon={IconCreditCard}
            >
              {t`${price.label}: ${formattedPrice}`}
            </AppConsentCardRow>
          );
        })}
      </AppConsentCard>
    </AppConsentDialog>
  );
};
