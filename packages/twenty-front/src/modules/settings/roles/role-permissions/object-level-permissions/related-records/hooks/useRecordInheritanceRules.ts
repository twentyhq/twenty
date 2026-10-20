import { useMutation, useQuery } from '@apollo/client/react';

import {
  CreateRecordInheritanceRuleDocument,
  DeleteRecordInheritanceRuleDocument,
  FindManyRecordInheritanceRulesDocument,
} from '~/generated-metadata/graphql';

export const useRecordInheritanceRules = ({ skip }: { skip: boolean }) => {
  const { data } = useQuery(FindManyRecordInheritanceRulesDocument, { skip });

  const refetchOptions = {
    refetchQueries: [{ query: FindManyRecordInheritanceRulesDocument }],
    awaitRefetchQueries: true,
  };

  const [createRecordInheritanceRule] = useMutation(
    CreateRecordInheritanceRuleDocument,
    refetchOptions,
  );
  const [deleteRecordInheritanceRule] = useMutation(
    DeleteRecordInheritanceRuleDocument,
    refetchOptions,
  );

  return {
    recordInheritanceRules: data?.recordInheritanceRules ?? [],
    createRecordInheritanceRule: (input: {
      objectMetadataId: string;
      fieldMetadataId: string;
      junctionFieldMetadataId: string | null;
    }) => createRecordInheritanceRule({ variables: { input } }),
    deleteRecordInheritanceRule: (id: string) =>
      deleteRecordInheritanceRule({ variables: { id } }),
  };
};
