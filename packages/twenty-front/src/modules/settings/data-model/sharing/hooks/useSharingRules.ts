import { useQuery } from '@apollo/client/react';

import { SHARING_RULES } from '@/settings/data-model/sharing/graphql/queries/sharingRulesQuery';
import { type SharingRule } from '~/generated-metadata/graphql';

export type SharingRulesQueryResult = {
  sharingRules: SharingRule[];
};

export const useSharingRules = (objectMetadataId: string) => {
  const { data, loading } = useQuery<
    SharingRulesQueryResult,
    { objectMetadataId: string }
  >(SHARING_RULES, { variables: { objectMetadataId } });

  return { sharingRules: data?.sharingRules ?? [], loading };
};
