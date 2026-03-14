import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type UseRelationFieldAdditionalFilterParams = {
  fieldName: string;
  recordId: string;
  objectNameSingular: string;
};

// Returns a GraphQL filter to restrict relation field picker results based on
// business rules (account type constraints, team-to-account scoping).
//
// NOTE: The single-record picker uses the /search endpoint, which only accepts
// ObjectRecordFilterInput with { id, createdAt, deletedAt, updatedAt } fields.
// Filtering by custom relation fields (e.g. owningCompanyId) is not supported
// there. For relation-scoped filters we must resolve the allowed IDs first and
// pass { id: { in: [...] } } to stay within what the search endpoint accepts.
export const useRelationFieldAdditionalFilter = ({
  fieldName,
  recordId,
  objectNameSingular,
}: UseRelationFieldAdditionalFilterParams): ObjectRecordFilterInput | undefined => {
  const isAssociatedDeskField = fieldName === 'associatedDesk';
  const isOpportunity = objectNameSingular === 'opportunity';

  // Fetch opportunity with its company and that company's desks in one call.
  // skip when not needed so this hook is always called (rules of hooks).
  const { record: opportunityRecord } = useFindOneRecord({
    objectNameSingular: 'opportunity',
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      company: { id: true, desks: { id: true } },
    },
    skip: !(isAssociatedDeskField && isOpportunity),
  });

  if (fieldName === 'clientAccount') {
    return { accountType: { eq: 'LEGAL_ENTITY' } };
  }

  if (fieldName === 'parentAccount') {
    return { accountType: { eq: 'PARENT' } };
  }

  if (isAssociatedDeskField && isOpportunity) {
    const company = (
      opportunityRecord as {
        company?: { id?: string; desks?: { id: string }[] } | null;
      } | null
    )?.company;

    if (!company?.id) {
      // No company selected yet — show nothing
      return { id: { eq: 'no-match' } };
    }

    const deskIds = (company.desks ?? []).map((d) => d.id).filter(Boolean);

    if (deskIds.length === 0) {
      // Company has no desks yet — show nothing
      return { id: { eq: 'no-match' } };
    }

    return { id: { in: deskIds } };
  }

  return undefined;
};
