import { useMutation } from '@apollo/client/react';
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

  const upsertTimelineActivityRule = async (
    input: UpsertTimelineActivityRuleInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { upsertTimelineActivityRule, loading };
};
