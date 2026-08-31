import { type ApplicationOperationFailureBroadcastRecord } from '@/applications/types/ApplicationOperationFailureBroadcastRecord';
import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { t } from '@lingui/core/macro';
import { useCallback } from 'react';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

const getApplicationOperationFailureMessage = ({
  operation,
  applicationName,
}: ApplicationOperationFailureBroadcastRecord): string | undefined => {
  const hasName = isNonEmptyString(applicationName);

  switch (operation) {
    case 'install':
      return hasName
        ? t`Failed to install ${applicationName}.`
        : t`Failed to install the application.`;
    case 'upgrade':
      return hasName
        ? t`Failed to upgrade ${applicationName}.`
        : t`Failed to upgrade the application.`;
    case 'uninstall':
      return hasName
        ? t`Failed to uninstall ${applicationName}.`
        : t`Failed to uninstall the application.`;
    default:
      return undefined;
  }
};

// Install, upgrade and uninstall run in a background job, so their failures
// cannot surface as mutation errors: the server broadcasts them to the user who
// asked for the operation instead.
export const useListenToApplicationOperationFailureEvents = () => {
  const { enqueueErrorSnackBar } = useSnackBar();

  const handleApplicationOperationFailureEvent = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationOperationFailureBroadcastRecord>,
    ) => {
      if (detail.operation.type !== 'create') {
        return;
      }

      const message = getApplicationOperationFailureMessage(
        detail.operation.createdRecord,
      );

      if (!isDefined(message)) {
        return;
      }

      const { universalIdentifier, operation } = detail.operation.createdRecord;

      // The SSE stream hands the same event to the sink and to the message
      // listener, so every broadcast reaches this hook twice.
      enqueueErrorSnackBar({
        message,
        options: {
          dedupeKey: `application-${operation}-failure-${universalIdentifier}`,
        },
      });
    },
    [enqueueErrorSnackBar],
  );

  useListenToMetadataOperationBrowserEvent<ApplicationOperationFailureBroadcastRecord>(
    {
      metadataName: 'applicationOperationFailure',
      onMetadataOperationBrowserEvent: handleApplicationOperationFailureEvent,
    },
  );
};
