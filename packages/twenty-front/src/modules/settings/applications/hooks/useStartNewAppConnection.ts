import { isNonEmptyArray } from 'twenty-shared/utils';

import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { getConnectionBillingValidationModalInstanceId } from '@/settings/applications/utils/getConnectionBillingValidationModalInstanceId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type ApplicationBillingPrice } from '~/generated-metadata/graphql';

export const useStartNewAppConnection = ({
  applicationId,
  connectionProviderName,
  connectionProviderType,
  connectedAccountPrices,
  redirectLocation,
}: {
  applicationId: string;
  connectionProviderName: string;
  connectionProviderType: string;
  connectedAccountPrices: ApplicationBillingPrice[];
  redirectLocation?: string;
}) => {
  const { startAppConnection } = useStartAppConnection();
  const { openDialog } = useDialog();

  const startNewAppConnection = () => {
    if (isNonEmptyArray(connectedAccountPrices)) {
      openDialog(
        getConnectionBillingValidationModalInstanceId({
          applicationId,
          connectionProviderName,
        }),
      );

      return;
    }

    startAppConnection({
      applicationId,
      connectionProviderName,
      connectionProviderType,
      redirectLocation,
    });
  };

  return { startNewAppConnection };
};
