import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type UseRelationFieldAdditionalFilterParams = {
  fieldName: string;
  recordId: string;
  objectNameSingular: string;
};

// Returns a GraphQL filter to restrict relation field picker results based on
// business rules (account type constraints, team-to-account scoping).
export const useRelationFieldAdditionalFilter = ({
  fieldName,
  recordId,
  objectNameSingular,
}: UseRelationFieldAdditionalFilterParams): ObjectRecordFilterInput | undefined => {
  const isClientAccountTeamField = fieldName === 'clientAccountTeam';
  const isOpportunity = objectNameSingular === 'opportunity';

  const { record: opportunityRecord } = useFindOneRecord({
    objectNameSingular: 'opportunity',
    objectRecordId: recordId,
    recordGqlFields: { id: true, clientAccount: { id: true } },
    skip: !(isClientAccountTeamField && isOpportunity),
  });

  if (fieldName === 'clientAccount') {
    return { accountType: { eq: 'LEGAL_ENTITY' } };
  }

  if (fieldName === 'parentAccount') {
    return { accountType: { eq: 'PARENT' } };
  }

  if (isClientAccountTeamField && isOpportunity) {
    const clientAccountId = (
      opportunityRecord as { clientAccount?: { id?: string } } | null
    )?.clientAccount?.id;

    if (clientAccountId) {
      return { withinCompany: { id: { eq: clientAccountId } } };
    }
    // No client account selected yet — show no teams rather than all teams
    return { id: { eq: 'no-match' } };
  }

  return undefined;
};
