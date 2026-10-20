import { useMutation } from '@apollo/client/react';

import {
  CreateRecordInheritanceRuleDocument,
  DeleteRecordInheritanceRuleDocument,
  FindManyRecordInheritanceRulesDocument,
} from '~/generated-metadata/graphql';

const REFETCH_OPTIONS = {
  refetchQueries: [{ query: FindManyRecordInheritanceRulesDocument }],
  awaitRefetchQueries: true,
};

export const useRecordInheritanceRuleMutations = () => {
  const [createRecordInheritanceRule] = useMutation(
    CreateRecordInheritanceRuleDocument,
    REFETCH_OPTIONS,
  );
  const [deleteRecordInheritanceRule] = useMutation(
    DeleteRecordInheritanceRuleDocument,
    REFETCH_OPTIONS,
  );

  return {
    createRecordInheritanceRule: (input: {
      objectMetadataId: string;
      fieldMetadataId: string;
      junctionFieldMetadataId: string | null;
    }) => createRecordInheritanceRule({ variables: { input } }),
    deleteRecordInheritanceRule: (id: string) =>
      deleteRecordInheritanceRule({ variables: { id } }),
  };
};
