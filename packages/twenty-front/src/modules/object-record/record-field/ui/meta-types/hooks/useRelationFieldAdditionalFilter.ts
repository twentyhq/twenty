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
  const isCompany = objectNameSingular === 'company';

  // For parentAccount / childAccount on company: fetch the current company's
  // accountType so we can enforce one-layer-deep hierarchy rules:
  //   - PARENT companies may not have a parent (hide parentAccount picker)
  //   - LEGAL_ENTITY companies may not have children (hide childAccount picker)
  const needsCurrentCompanyAccountType =
    isCompany && (fieldName === 'parentAccount' || fieldName === 'childAccount');

  const { record: currentCompanyRecord, loading: currentCompanyLoading } =
    useFindOneRecord({
      objectNameSingular: 'company',
      objectRecordId: recordId,
      recordGqlFields: { id: true, accountType: true },
      skip: !needsCurrentCompanyAccountType,
    });

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

  // Several fields need the full list of PARENT company IDs:
  // - clientAccount: exclude PARENTs (only show LEGAL_ENTITY)
  // - parentAccount: only show PARENTs (whitelist)
  // - childAccount on company: exclude PARENTs (only show LEGAL_ENTITY)
  // - company on person/opportunity: exclude PARENTs
  const isCompanyFieldOnPersonOrOpp =
    fieldName === 'company' &&
    (objectNameSingular === 'person' || objectNameSingular === 'opportunity');
  const isChildAccountOnCompany =
    fieldName === 'childAccount' && objectNameSingular === 'company';
  const needsParentIds =
    fieldName === 'clientAccount' ||
    fieldName === 'parentAccount' ||
    isChildAccountOnCompany ||
    isCompanyFieldOnPersonOrOpp;

  const {
    records: parentCompanies,
    loading: parentCompaniesLoading,
  } = useFindManyRecords({
    objectNameSingular: 'company',
    filter: { accountType: { eq: 'PARENT' } } as ObjectRecordFilterInput,
    recordGqlFields: { id: true },
    skip: !needsParentIds,
  });

  // clientAccount: only show LEGAL_ENTITY companies (exclude PARENTs)
  if (fieldName === 'clientAccount') {
    if (parentCompaniesLoading) return { id: { eq: 'no-match' } };
    const parentIds = parentCompanies.map((c) => c.id);
    return parentIds.length > 0 ? { not: { id: { in: parentIds } } } : undefined;
  }

  // parentAccount: only show PARENT companies (whitelist by ID).
  // Also enforce hierarchy: a PARENT company cannot itself have a parent.
  if (fieldName === 'parentAccount') {
    if (currentCompanyLoading || parentCompaniesLoading) return { id: { eq: 'no-match' } };
    const currentAccountType = (currentCompanyRecord as { accountType?: string } | null)?.accountType;
    if (currentAccountType === 'PARENT') return { id: { eq: 'no-match' } };
    const parentIds = parentCompanies.map((c) => c.id);
    return parentIds.length > 0 ? { id: { in: parentIds } } : { id: { eq: 'no-match' } };
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

  // childAccount on company: only show LEGAL_ENTITY companies (exclude PARENTs).
  // Also enforce hierarchy: a LEGAL_ENTITY company cannot have children.
  if (isChildAccountOnCompany) {
    if (currentCompanyLoading || parentCompaniesLoading) return { id: { eq: 'no-match' } };
    const currentAccountType = (currentCompanyRecord as { accountType?: string } | null)?.accountType;
    if (currentAccountType === 'LEGAL_ENTITY') return { id: { eq: 'no-match' } };
    const parentIds = parentCompanies.map((c) => c.id);
    return parentIds.length > 0 ? { not: { id: { in: parentIds } } } : undefined;
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
