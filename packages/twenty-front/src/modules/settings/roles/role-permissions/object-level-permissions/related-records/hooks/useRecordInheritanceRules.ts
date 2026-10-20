import { useQuery } from '@apollo/client/react';

import { FindManyRecordInheritanceRulesDocument } from '~/generated-metadata/graphql';

export const useRecordInheritanceRules = ({ skip }: { skip: boolean }) => {
  const { data } = useQuery(FindManyRecordInheritanceRulesDocument, { skip });

  return { recordInheritanceRules: data?.recordInheritanceRules ?? [] };
};
