import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent, useRecordId } from 'twenty-sdk';
import { isDefined } from 'twenty-shared/utils';

import { QUOTE_SECTIONS_PANEL_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

// ── Types ─────────────────────────────────────────────────────────────────────

type CurrencyAmount = {
  amountMicros: number | null;
  currencyCode: string | null;
};

type LineItem = {
  id: string;
  name: string | null;
  feeType: string | null;
  estimatedHours: number | null;
  hourlyRate: CurrencyAmount | null;
  fixedFeeAmount: CurrencyAmount | null;
  estimatedLineAmount: CurrencyAmount | null;
  lineItemPosition: number | null;
};

type QuoteTerm = {
  id: string;
  termType: string | null;
  feePercentage: number | null;
  affectsFees: boolean | null;
};

type QuoteSection = {
  id: string;
  name: string | null;
  serviceCategory: string | null;
  sectionPosition: number | null;
  subtotal: CurrencyAmount | null;
  lineItems: { edges: { node: LineItem }[] } | null;
  quoteTerms: { edges: { node: QuoteTerm }[] } | null;
};

// ── Formatting helpers ────────────────────────────────────────────────────────

const formatCurrency = (amount: CurrencyAmount | null): string => {
  if (!isDefined(amount) || !isDefined(amount.amountMicros)) return '—';
  const value = amount.amountMicros / 1_000_000;
  const code = amount.currencyCode ?? 'GBP';
  try {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: code,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${code} ${value.toFixed(2)}`;
  }
};

const formatHours = (hours: number | null): string =>
  isDefined(hours) ? `${hours}h` : '—';

const formatPercent = (pct: number | null): string =>
  isDefined(pct) ? `${pct > 0 ? '+' : ''}${pct}%` : '—';

// ── Styles ────────────────────────────────────────────────────────────────────

const S = {
  container: {
    height: '100%',
    overflowY: 'auto' as const,
    padding: '16px',
    boxSizing: 'border-box' as const,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontSize: '13px',
    color: '#1a1a1a',
    backgroundColor: '#fafafa',
  },
  sectionCard: {
    background: '#ffffff',
    border: '1px solid #e5e5e5',
    borderRadius: '8px',
    marginBottom: '16px',
    overflow: 'hidden' as const,
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    background: '#f5f5f5',
    borderBottom: '1px solid #e5e5e5',
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '14px',
    color: '#111',
  },
  sectionMeta: {
    fontSize: '12px',
    color: '#666',
    marginTop: '2px',
  },
  sectionSubtotal: {
    fontWeight: 600,
    fontSize: '13px',
    color: '#333',
  },
  subsectionLabel: {
    padding: '8px 16px 4px',
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: '12px',
  },
  th: {
    padding: '6px 16px',
    textAlign: 'left' as const,
    fontWeight: 600,
    color: '#555',
    borderBottom: '1px solid #efefef',
    whiteSpace: 'nowrap' as const,
  },
  thRight: {
    padding: '6px 16px',
    textAlign: 'right' as const,
    fontWeight: 600,
    color: '#555',
    borderBottom: '1px solid #efefef',
    whiteSpace: 'nowrap' as const,
  },
  td: {
    padding: '7px 16px',
    borderBottom: '1px solid #f5f5f5',
    color: '#333',
  },
  tdRight: {
    padding: '7px 16px',
    borderBottom: '1px solid #f5f5f5',
    color: '#333',
    textAlign: 'right' as const,
  },
  emptyRow: {
    padding: '8px 16px 12px',
    fontSize: '12px',
    color: '#aaa',
    fontStyle: 'italic' as const,
  },
  feeTypeBadge: (feeType: string | null) => ({
    display: 'inline-block',
    padding: '1px 6px',
    borderRadius: '3px',
    fontSize: '11px',
    fontWeight: 600,
    background: feeType === 'TIME_AND_MATERIALS' ? '#e8f4fd' : '#f0f7ee',
    color: feeType === 'TIME_AND_MATERIALS' ? '#1976d2' : '#388e3c',
  }),
  loadingState: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    color: '#aaa',
    fontSize: '13px',
  },
  errorState: {
    padding: '16px',
    color: '#d32f2f',
    fontSize: '12px',
  },
};

// ── Line Items table ──────────────────────────────────────────────────────────

const LineItemsTable = ({ items }: { items: LineItem[] }) => {
  const sorted = [...items].sort(
    (a, b) => (a.lineItemPosition ?? 0) - (b.lineItemPosition ?? 0),
  );

  return (
    <>
      <div style={S.subsectionLabel}>Line Items</div>
      {sorted.length === 0 ? (
        <div style={S.emptyRow}>No line items</div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Name</th>
              <th style={S.th}>Type</th>
              <th style={S.thRight}>Hours</th>
              <th style={S.thRight}>Rate</th>
              <th style={S.thRight}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <tr key={item.id}>
                <td style={S.td}>{item.name ?? '—'}</td>
                <td style={S.td}>
                  {isDefined(item.feeType) ? (
                    <span style={S.feeTypeBadge(item.feeType)}>
                      {item.feeType === 'TIME_AND_MATERIALS' ? 'T&M' : item.feeType}
                    </span>
                  ) : (
                    '—'
                  )}
                </td>
                <td style={S.tdRight}>{formatHours(item.estimatedHours)}</td>
                <td style={S.tdRight}>
                  {item.feeType === 'TIME_AND_MATERIALS'
                    ? formatCurrency(item.hourlyRate)
                    : '—'}
                </td>
                <td style={S.tdRight}>
                  {item.feeType === 'TIME_AND_MATERIALS'
                    ? formatCurrency(item.estimatedLineAmount ?? item.fixedFeeAmount)
                    : formatCurrency(item.fixedFeeAmount ?? item.estimatedLineAmount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

// ── Quote Terms table ─────────────────────────────────────────────────────────

const QuoteTermsTable = ({ terms }: { terms: QuoteTerm[] }) => (
  <>
    <div style={{ ...S.subsectionLabel, marginTop: '8px' }}>Quote Terms</div>
    {terms.length === 0 ? (
      <div style={S.emptyRow}>No quote terms</div>
    ) : (
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Term Type</th>
            <th style={S.thRight}>Fee +/−</th>
            <th style={S.th}>Affects Fees?</th>
          </tr>
        </thead>
        <tbody>
          {terms.map((term) => (
            <tr key={term.id}>
              <td style={S.td}>{term.termType ?? '—'}</td>
              <td style={S.tdRight}>{formatPercent(term.feePercentage)}</td>
              <td style={S.td}>{term.affectsFees === true ? 'Yes' : term.affectsFees === false ? 'No' : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </>
);

// ── Section card ──────────────────────────────────────────────────────────────

const SectionCard = ({
  section,
  index,
}: {
  section: QuoteSection;
  index: number;
}) => {
  const lineItems = section.lineItems?.edges?.map((e) => e.node) ?? [];
  const quoteTerms = section.quoteTerms?.edges?.map((e) => e.node) ?? [];
  const sectionNum = section.sectionPosition ?? index + 1;

  return (
    <div style={S.sectionCard}>
      <div style={S.sectionHeader}>
        <div>
          <div style={S.sectionTitle}>
            §{sectionNum} &nbsp; {section.name ?? 'Unnamed Section'}
          </div>
          {isDefined(section.serviceCategory) && (
            <div style={S.sectionMeta}>{section.serviceCategory}</div>
          )}
        </div>
        <div style={S.sectionSubtotal}>{formatCurrency(section.subtotal)}</div>
      </div>

      <LineItemsTable items={lineItems} />
      <QuoteTermsTable terms={quoteTerms} />
      <div style={{ height: '8px' }} />
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const QuoteSectionsPanel = () => {
  const recordId = useRecordId();
  const [sections, setSections] = useState<QuoteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSections = useCallback(async () => {
    if (!isDefined(recordId)) {
      setLoading(false);
      setError('No record ID available');
      return;
    }

    try {
      setError(null);

      const baseUrl = process.env.TWENTY_API_URL ?? '';
      const apiUrl = baseUrl.endsWith('/graphql')
        ? baseUrl
        : `${baseUrl}/graphql`;
      const token =
        process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token ?? ''}`,
        },
        body: JSON.stringify({
          query: `
            query GetQuoteSections($quoteId: UUID!) {
              quoteSections(
                filter: { quoteId: { eq: $quoteId } }
                orderBy: [{ sectionPosition: AscNullsLast }]
              ) {
                edges {
                  node {
                    id
                    name
                    serviceCategory
                    sectionPosition
                    subtotal { amountMicros currencyCode }
                    lineItems {
                      edges {
                        node {
                          id
                          name
                          feeType
                          estimatedHours
                          hourlyRate { amountMicros currencyCode }
                          fixedFeeAmount { amountMicros currencyCode }
                          estimatedLineAmount { amountMicros currencyCode }
                          lineItemPosition
                        }
                      }
                    }
                    quoteTerms {
                      edges {
                        node {
                          id
                          termType
                          feePercentage
                          affectsFees
                        }
                      }
                    }
                  }
                }
              }
            }
          `,
          variables: { quoteId: recordId },
        }),
      });

      const json = await response.json();
      if (json.errors?.length) {
        throw new Error(json.errors[0].message);
      }

      const fetched: QuoteSection[] =
        json.data?.quoteSections?.edges?.map(
          (e: { node: QuoteSection }) => e.node,
        ) ?? [];
      setSections(fetched);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  if (loading) {
    return <div style={S.loadingState}>Loading sections…</div>;
  }

  if (isDefined(error)) {
    return <div style={S.errorState}>Error: {error}</div>;
  }

  if (sections.length === 0) {
    return (
      <div style={{ ...S.loadingState, color: '#bbb', fontStyle: 'italic' }}>
        No quote sections yet
      </div>
    );
  }

  return (
    <div style={S.container}>
      {sections.map((section, idx) => (
        <SectionCard key={section.id} section={section} index={idx} />
      ))}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: QUOTE_SECTIONS_PANEL_UNIVERSAL_IDENTIFIER,
  name: 'quote-sections-panel',
  description: 'Stacked cards showing Quote Sections, Line Items, and Quote Terms',
  component: QuoteSectionsPanel,
});
