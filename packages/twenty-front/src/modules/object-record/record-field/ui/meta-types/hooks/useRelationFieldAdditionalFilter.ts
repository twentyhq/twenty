import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { type ObjectRecordFilterInput } from '~/generated/graphql';

type UseRelationFieldAdditionalFilterParams = {
  fieldName: string;
  recordId: string;
  objectNameSingular: string;
};

// Returns a GraphQL filter to restrict relation field picker results based on
// business rules (team-to-account scoping).
//
// NOTE: The single-record picker uses the /search endpoint, which only accepts
// ObjectRecordFilterInput with { id, createdAt, deletedAt, updatedAt } fields.
// Custom relation/scalar fields are NOT supported there. For custom-field-based
// filters we resolve the affected IDs via the workspace endpoint
// (useFindOneRecord) and then pass an id-based filter to stay within what the
// search endpoint accepts.
export const useRelationFieldAdditionalFilter = ({
  fieldName,
  recordId,
  objectNameSingular,
}: UseRelationFieldAdditionalFilterParams): ObjectRecordFilterInput | undefined => {
  const isAssociatedDeskField = fieldName === 'associatedDesk';
  const isOpportunity = objectNameSingular === 'opportunity';

  // For associatedDesk on opportunity: fetch company + its desks in one call.
  const { record: opportunityRecord } = useFindOneRecord({
    objectNameSingular: 'opportunity',
    objectRecordId: recordId,
    recordGqlFields: {
      id: true,
      company: { id: true, desks: { id: true } },
    },
    skip: !(isAssociatedDeskField && isOpportunity),
  });

  if (isAssociatedDeskField && isOpportunity) {
    const company = (
      opportunityRecord as {
        company?: { id?: string; desks?: { id: string }[] } | null;
      } | null
    )?.company;

    if (!company?.id) {
      return { id: { eq: 'no-match' } };
    }

    const deskIds = (company.desks ?? []).map((d) => d.id).filter(Boolean);

    if (deskIds.length === 0) {
      return { id: { eq: 'no-match' } };
    }

    return { id: { in: deskIds } };
  }

  return undefined;
};
