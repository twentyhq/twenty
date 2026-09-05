import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useAddDuplicatedRecordToCache } from '@/object-record/cache/hooks/useAddDuplicatedRecordToCache';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular, CrudOperationType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { DuplicateDashboardDocument } from '~/generated-metadata/graphql';

export const useDuplicateDashboard = () => {
  const { addDuplicatedRecordToCache } = useAddDuplicatedRecordToCache({
    objectNameSingular: CoreObjectNameSingular.Dashboard,
  });

  const [mutate] = useMutation(DuplicateDashboardDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const duplicateDashboard = async (dashboardId: string) => {
    try {
      const result = await mutate({
        variables: { id: dashboardId },
        update: (cache, { data }) => {
          const record = data?.duplicateDashboard;

          if (!isDefined(record)) return;

          addDuplicatedRecordToCache(cache, record);
        },
      });

      return result?.data?.duplicateDashboard;
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'pageLayoutWidget',
          operationType: CrudOperationType.CREATE,
        });
      } else {
        enqueueErrorSnackBar({ message: t`Failed to duplicate dashboard` });
      }

      return undefined;
    }
  };

  return {
    duplicateDashboard,
  };
};
