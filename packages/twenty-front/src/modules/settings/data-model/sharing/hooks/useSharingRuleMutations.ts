import { useMutation } from '@apollo/client/react';

import { CREATE_SHARING_RULE } from '@/settings/data-model/sharing/graphql/mutations/createSharingRuleMutation';
import { DELETE_SHARING_RULE } from '@/settings/data-model/sharing/graphql/mutations/deleteSharingRuleMutation';
import { UPDATE_SHARING_RULE } from '@/settings/data-model/sharing/graphql/mutations/updateSharingRuleMutation';
import { SHARING_RULES } from '@/settings/data-model/sharing/graphql/queries/sharingRulesQuery';
import {
  type CreateSharingRuleInput,
  type SharingRule,
  type UpdateSharingRuleInput,
} from '~/generated-metadata/graphql';

const REFETCH_SHARING_RULES = {
  refetchQueries: [SHARING_RULES],
};

export const useSharingRuleMutations = () => {
  const [createSharingRuleMutation] = useMutation<
    { createSharingRule: SharingRule },
    { input: CreateSharingRuleInput }
  >(CREATE_SHARING_RULE, REFETCH_SHARING_RULES);
  const [updateSharingRuleMutation] = useMutation<
    { updateSharingRule: SharingRule },
    { input: UpdateSharingRuleInput }
  >(UPDATE_SHARING_RULE);
  const [deleteSharingRuleMutation] = useMutation<
    { deleteSharingRule: SharingRule },
    { id: string }
  >(DELETE_SHARING_RULE, REFETCH_SHARING_RULES);

  const createSharingRule = (input: CreateSharingRuleInput) =>
    createSharingRuleMutation({ variables: { input } });

  const updateSharingRule = (input: UpdateSharingRuleInput) =>
    updateSharingRuleMutation({ variables: { input } });

  const deleteSharingRule = (id: string) =>
    deleteSharingRuleMutation({ variables: { id } });

  return { createSharingRule, updateSharingRule, deleteSharingRule };
};
