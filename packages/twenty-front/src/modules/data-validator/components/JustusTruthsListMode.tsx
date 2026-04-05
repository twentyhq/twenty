import { useCallback, useMemo, useState } from 'react';
import styled from '@emotion/styled';
import { useInView } from 'react-intersection-observer';

import {
  JUSTUS_TRUTH_CLAIM_TYPES,
  JUSTUS_TRUTH_DOMAINS,
  JUSTUS_TRUTH_STATUSES,
} from '@/data-validator/constants/JustusTruthDomains.constants';
import { JUSTUS_TRUTH_LIST_GQL_FIELDS } from '@/data-validator/constants/JustusTruthGqlFields.constants';
import { JUSTUS_TRUTH_OBJECT_NAME_SINGULAR } from '@/data-validator/constants/JustusTruthObjectName.constants';
import { INITIAL_TRUTH_FILTER_VALUES } from '@/data-validator/constants/InitialTruthFilterValues.constants';
import {
  type JustusTruthRecord,
  type TruthFilterValues,
} from '@/data-validator/types/data-validator.types';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';

const DOMAIN_COLORS: Record<string, string> = {
  movement: '#3b82f6',
  pain_science: '#ef4444',
  coaching: '#22c55e',
  business: '#8b5cf6',
  mindset: '#f59e0b',
  nutrition: '#10b981',
  sales: '#f97316',
  none: '#6b7280',
};

const STATUS_COLORS: Record<string, string> = {
  candidate: '#6b7280',
  approved: '#22c55e',
  supported: '#3b82f6',
  deprecated: '#ef4444',
};

const buildFilter = (filters: TruthFilterValues) => {
  const conditions: Record<string, unknown>[] = [];

  if (filters.searchTerm.trim()) {
    const term = `%${filters.searchTerm.trim()}%`;
    conditions.push({
      or: [
        { truthText: { ilike: term } },
        { domain: { ilike: term } },
      ],
    });
  }

  if (filters.domain) {
    conditions.push({ domain: { eq: filters.domain } });
  }

  if (filters.claimType) {
    conditions.push({ claimType: { eq: filters.claimType } });
  }

  if (filters.status) {
    conditions.push({ status: { eq: filters.status } });
  }

  if (conditions.length === 0) return undefined;
  if (conditions.length === 1) return conditions[0];
  return { and: conditions };
};

// --- Styled Components ---

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const StyledFilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  background: ${({ theme }) => theme.background.primary};
  flex-wrap: wrap;
  flex-shrink: 0;
`;

const StyledSearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  min-width: 200px;
  flex: 1;

  &::placeholder {
    color: ${({ theme }) => theme.font.color.tertiary};
  }

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledSelect = styled.select`
  padding: ${({ theme }) => theme.spacing(2)} ${({ theme }) => theme.spacing(3)};
  font-family: ${({ theme }) => theme.font.family};
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.color.blue};
  }
`;

const StyledListContainer = styled.div`
  flex: 1;
  overflow-y: auto;
`;

const StyledRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
  padding: ${({ theme }) => theme.spacing(3)} ${({ theme }) => theme.spacing(4)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  transition: background 100ms ease;

  &:hover {
    background: ${({ theme }) => theme.background.secondary};
  }
`;

const StyledTruthText = styled.span`
  flex: 1;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPill = styled.span<{ $bg: string; $light?: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 500;
  border-radius: 10px;
  white-space: nowrap;
  color: ${({ $light }) => ($light ? '#ffffff' : 'inherit')};
  background: ${({ $bg }) => $bg};
`;

const StyledEvidenceCount = styled.span`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
  min-width: 24px;
  text-align: right;
`;

const StyledLoading = styled.div`
  padding: ${({ theme }) => theme.spacing(4)};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledEmpty = styled.div`
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledSentinel = styled.div`
  height: 1px;
`;

// --- Component ---

export const JustusTruthsListMode = () => {
  const [filters, setFilters] = useState<TruthFilterValues>(
    INITIAL_TRUTH_FILTER_VALUES,
  );

  const filter = useMemo(() => buildFilter(filters), [filters]);

  const {
    records,
    loading,
    fetchMoreRecords,
    hasNextPage,
    totalCount,
  } = useFindManyRecords({
    objectNameSingular: JUSTUS_TRUTH_OBJECT_NAME_SINGULAR,
    filter,
    orderBy: [{ createdAt: 'DescNullsLast' as const }],
    recordGqlFields: JUSTUS_TRUTH_LIST_GQL_FIELDS,
    limit: 50,
  });

  const { ref: sentinelRef } = useInView({
    onChange: (inView) => {
      if (inView && hasNextPage && !loading) {
        fetchMoreRecords?.();
      }
    },
  });

  const handleFilterChange = useCallback(
    (field: keyof TruthFilterValues, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    [],
  );

  const truths = records as JustusTruthRecord[];

  return (
    <StyledContainer>
      <StyledFilterBar>
        <StyledSearchInput
          type="text"
          placeholder="Search truths..."
          value={filters.searchTerm}
          onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
        />
        <StyledSelect
          value={filters.domain}
          onChange={(e) => handleFilterChange('domain', e.target.value)}
        >
          <option value="">All domains</option>
          {JUSTUS_TRUTH_DOMAINS.map((d) => (
            <option key={d} value={d}>
              {d.replace('_', ' ')}
            </option>
          ))}
        </StyledSelect>
        <StyledSelect
          value={filters.claimType}
          onChange={(e) => handleFilterChange('claimType', e.target.value)}
        >
          <option value="">All claim types</option>
          {JUSTUS_TRUTH_CLAIM_TYPES.map((ct) => (
            <option key={ct} value={ct}>
              {ct}
            </option>
          ))}
        </StyledSelect>
        <StyledSelect
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="">All statuses</option>
          {JUSTUS_TRUTH_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </StyledSelect>
      </StyledFilterBar>
      <StyledListContainer>
        {truths.map((truth) => {
          const domainColor =
            DOMAIN_COLORS[truth.domain ?? 'none'] ?? DOMAIN_COLORS.none;
          const statusColor =
            STATUS_COLORS[truth.status ?? 'candidate'] ??
            STATUS_COLORS.candidate;

          return (
            <StyledRow key={truth.id}>
              <StyledTruthText>
                {truth.truthText.length > 120
                  ? `${truth.truthText.slice(0, 120)}...`
                  : truth.truthText}
              </StyledTruthText>
              {truth.domain && (
                <StyledPill $bg={domainColor} $light>
                  {truth.domain.replace('_', ' ')}
                </StyledPill>
              )}
              {truth.claimType && (
                <StyledPill $bg="#e5e7eb">{truth.claimType}</StyledPill>
              )}
              <StyledPill $bg={statusColor} $light>
                {truth.status ?? 'candidate'}
              </StyledPill>
              <StyledEvidenceCount>
                {truth.evidenceCount ?? 0}
              </StyledEvidenceCount>
            </StyledRow>
          );
        })}
        {loading && <StyledLoading>Loading...</StyledLoading>}
        {!loading && truths.length === 0 && (
          <StyledEmpty>
            {totalCount === 0
              ? 'No truths match your filters'
              : 'No truths found'}
          </StyledEmpty>
        )}
        {hasNextPage && <StyledSentinel ref={sentinelRef} />}
      </StyledListContainer>
    </StyledContainer>
  );
};
