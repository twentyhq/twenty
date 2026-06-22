import { useMutation, useQuery } from '@apollo/client/react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { createTimelineProjectionRule } from '@/settings/timeline/graphql/mutations/createTimelineProjectionRule';
import { deleteTimelineProjectionRule } from '@/settings/timeline/graphql/mutations/deleteTimelineProjectionRule';
import { getTimelineProjectionRules } from '@/settings/timeline/graphql/queries/getTimelineProjectionRules';
import { type TimelineProjectionRule } from '@/settings/timeline/types/TimelineProjectionRule';

type CreateTimelineProjectionRuleInput = {
  anchorObjectMetadataId: string;
  sourceObjectMetadataId: string;
  linkedObjectMetadataIds: string[];
};

export const useTimelineProjectionRules = () => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading, refetch } = useQuery<{
    getTimelineProjectionRules: TimelineProjectionRule[];
  }>(getTimelineProjectionRules, { client: apolloCoreClient });

  const [createRuleMutation] = useMutation(createTimelineProjectionRule, {
    client: apolloCoreClient,
  });

  const [deleteRuleMutation] = useMutation(deleteTimelineProjectionRule, {
    client: apolloCoreClient,
  });

  const createRule = async (input: CreateTimelineProjectionRuleInput) => {
    await createRuleMutation({ variables: { input } });
    await refetch();
  };

  const deleteRule = async (id: string) => {
    await deleteRuleMutation({ variables: { input: { id } } });
    await refetch();
  };

  return {
    rules: data?.getTimelineProjectionRules ?? [],
    loading,
    createRule,
    deleteRule,
  };
};
