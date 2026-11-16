import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { useAddDuplicatedRecordToCache } from '@/object-record/cache/hooks/useAddDuplicatedRecordToCache';
import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import {
  StandardObjectNameSingular,
  CrudOperationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { DuplicateDashboardDocument } from '~/generated-metadata/graphql';
import { useLingui } from '@lingui/react/macro';

export const useDuplicateDashboard = () => {
  const { t } = useLingui();
  const { addDuplicatedRecordToCache } = useAddDuplicatedRecordToCache({
    objectNameSingular: StandardObjectNameSingular.Dashboard,
  });

  const [mutate] = useMutation(DuplicateDashboardDocument);

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueToast } = useToast();

  const duplicateDashboard = async (dashboardId: string) => {
    try {
      const result = await mutate({
        variables: { id: dashboardId },
        update: (cache, { data }) => {
          const record = data?.duplicateDashboard;

          if (!isDefined(record)) {
            return;
          }

          addDuplicatedRecordToCache({ cache, record });
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
        enqueueToast({
          status: 'error',
          children: t`Failed to duplicate dashboard`,
        });
      }

      return undefined;
    }
  };

  return {
    duplicateDashboard,
  };
};
