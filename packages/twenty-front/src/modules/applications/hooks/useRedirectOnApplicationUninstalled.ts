import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { isApplicationNotFoundError } from '@/applications/utils/isApplicationNotFoundError';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { useCallback } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type UseRedirectOnApplicationUninstalledArgs = {
  applicationId?: string;
  refetch: () => Promise<unknown>;
};

export const useRedirectOnApplicationUninstalled = ({
  applicationId,
  refetch,
}: UseRedirectOnApplicationUninstalledArgs) => {
  const navigateSettings = useNavigateSettings();

  const onApplicationOperation = useCallback(
    async ({
      operation,
    }: MetadataOperationBrowserEventDetail<FlatApplication>) => {
      if (
        operation.type !== 'delete' ||
        !isDefined(applicationId) ||
        operation.deletedRecordId !== applicationId
      ) {
        return;
      }

      // A transient lookup failure must not bounce the visitor off the page:
      // only a lookup answering NOT_FOUND confirms the row is really gone.
      const lookupError = await refetch().then(
        () => null,
        (error: unknown) => error,
      );

      if (!isApplicationNotFoundError(lookupError)) {
        return;
      }

      navigateSettings(SettingsPath.Applications);
    },
    [applicationId, navigateSettings, refetch],
  );

  useListenToMetadataOperationBrowserEvent<FlatApplication>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: onApplicationOperation,
  });
};
