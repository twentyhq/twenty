import { isNonEmptyArray } from 'twenty-shared/utils';

import { useStartAppConnection } from '@/settings/applications/hooks/useStartAppConnection';
import { getConnectionBillingValidationModalInstanceId } from '@/settings/applications/utils/getConnectionBillingValidationModalInstanceId';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { type ApplicationConnectionProvider } from '~/generated-metadata/graphql';

export const useStartNewAppConnection = ({
  applicationId,
  connectionProvider,
  redirectLocation,
}: {
  applicationId: string;
  connectionProvider: Pick<
    ApplicationConnectionProvider,
    'name' | 'type' | 'connectedAccountPrices'
  >;
  redirectLocation?: string;
}) => {
  const { startAppConnection } = useStartAppConnection();
  const { openDialog } = useDialog();

  const startNewAppConnection = () => {
    if (isNonEmptyArray(connectionProvider.connectedAccountPrices)) {
      openDialog(
        getConnectionBillingValidationModalInstanceId({
          applicationId,
          connectionProviderName: connectionProvider.name,
        }),
      );

      return;
    }

    startAppConnection({
      applicationId,
      connectionProviderName: connectionProvider.name,
      connectionProviderType: connectionProvider.type,
      redirectLocation,
    });
  };

  return { startNewAppConnection };
};
