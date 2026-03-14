import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
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
// Custom relation/scalar fields (e.g. accountType, owningCompanyId) are NOT
// supported there. For custom-field-based filters we resolve the affected IDs
// via the workspace endpoint (useFindManyRecords / useFindOneRecord) and then
// pass an id-based filter to stay within what the search endpoint accepts.
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

  // For company pickers on person / opportunity: exclude PARENT-type companies.
  // We fetch PARENT company IDs via the workspace endpoint (which supports
  // custom field filters) and pass { not: { id: { in: [...] } } } to the
  // search endpoint (which only accepts id-based filters).
  const isCompanyFieldOnPersonOrOpp =
    fieldName === 'company' &&
    (objectNameSingular === 'person' || objectNameSingular === 'opportunity');

  const {
    records: parentCompanies,
    loading: parentCompaniesLoading,
  } = useFindManyRecords({
    objectNameSingular: 'company',
    filter: { accountType: { eq: 'PARENT' } } as ObjectRecordFilterInput,
    recordGqlFields: { id: true },
    skip: !isCompanyFieldOnPersonOrOpp,
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
      return { id: { eq: 'no-match' } };
    }

    const deskIds = (company.desks ?? []).map((d) => d.id).filter(Boolean);

    if (deskIds.length === 0) {
      return { id: { eq: 'no-match' } };
    }

    return { id: { in: deskIds } };
  }

  if (isCompanyFieldOnPersonOrOpp) {
    if (parentCompaniesLoading) {
      // Show nothing until we know which IDs to exclude
      return { id: { eq: 'no-match' } };
    }

    const parentIds = parentCompanies.map((c) => c.id);

    if (parentIds.length === 0) {
      // No PARENT companies exist — no restriction needed
      return undefined;
    }

    return { not: { id: { in: parentIds } } };
  }

  return undefined;
};
