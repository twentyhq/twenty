import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { CrudOperationType } from 'twenty-shared/types';

import { useMetadataErrorHandler } from '@/metadata-error-handler/hooks/useMetadataErrorHandler';
import { type MetadataRequestResult } from '@/object-metadata/types/MetadataRequestResult.type';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  FindManyTimelineActivityRulesDocument,
  UpsertTimelineActivityRuleDocument,
  type UpsertTimelineActivityRuleInput,
} from '~/generated-metadata/graphql';

export const useUpsertTimelineActivityRule = () => {
  const [mutate, { loading }] = useMutation(
    UpsertTimelineActivityRuleDocument,
    { refetchQueries: [FindManyTimelineActivityRulesDocument] },
  );

  const { handleMetadataError } = useMetadataErrorHandler();
  const { enqueueErrorSnackBar } = useSnackBar();

  const upsertTimelineActivityRule = async (
    input: UpsertTimelineActivityRuleInput,
  ): Promise<MetadataRequestResult<Awaited<ReturnType<typeof mutate>>>> => {
    try {
      const response = await mutate({ variables: { input } });

      return { status: 'successful', response };
    } catch (error) {
      if (CombinedGraphQLErrors.is(error)) {
        handleMetadataError(error, {
          primaryMetadataName: 'timelineActivityRule',
          operationType: CrudOperationType.UPDATE,
        });
      } else {
        enqueueErrorSnackBar({ message: t`An error occurred.` });
      }

      return { status: 'failed', error };
    }
  };

  return { upsertTimelineActivityRule, loading };
};
