import { useMutation } from '@apollo/client/react';

import {
  CreateValidationRuleDocument,
  DeleteValidationRuleDocument,
  FindManyValidationRulesDocument,
  UpdateValidationRuleDocument,
} from '~/generated-metadata/graphql';

export const useValidationRuleMutations = ({
  objectMetadataId,
}: {
  objectMetadataId: string;
}) => {
  const refetchOptions = {
    refetchQueries: [
      {
        query: FindManyValidationRulesDocument,
        variables: { objectMetadataId },
      },
    ],
    awaitRefetchQueries: true,
  };

  const [createValidationRule, { loading: isCreating }] = useMutation(
    CreateValidationRuleDocument,
    refetchOptions,
  );
  const [updateValidationRule, { loading: isUpdating }] = useMutation(
    UpdateValidationRuleDocument,
    refetchOptions,
  );
  const [deleteValidationRule, { loading: isDeleting }] = useMutation(
    DeleteValidationRuleDocument,
    refetchOptions,
  );

  return {
    createValidationRule,
    updateValidationRule,
    deleteValidationRule,
    isSaving: isCreating || isUpdating,
    isDeleting,
  };
};
