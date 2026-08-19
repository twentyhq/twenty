import { useMutation } from '@apollo/client/react';
import {
  FindManyTimelineActivityRulesDocument,
  ResetTimelineActivityRuleDocument,
  type ResetTimelineActivityRuleInput,
} from '~/generated-metadata/graphql';

export const useResetTimelineActivityRule = () => {
  const [mutate, { loading }] = useMutation(ResetTimelineActivityRuleDocument, {
    refetchQueries: [FindManyTimelineActivityRulesDocument],
  });

  const resetTimelineActivityRule = async (
    input: ResetTimelineActivityRuleInput,
  ) => {
    return await mutate({ variables: { input } });
  };

  return { resetTimelineActivityRule, loading };
};
