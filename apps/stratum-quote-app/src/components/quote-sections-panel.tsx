import { useCallback, useEffect, useRef, useState } from 'react';
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

// ── API helper ────────────────────────────────────────────────────────────────

function getApiConfig() {
  const baseUrl = process.env.TWENTY_API_URL ?? '';
  const apiUrl = baseUrl.endsWith('/graphql') ? baseUrl : `${baseUrl}/graphql`;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY ?? '';

  return { apiUrl, token };
}

async function gql(
  query: string,
  variables: Record<string, unknown>,
): Promise<unknown> {
  const { apiUrl, token } = getApiConfig();
  const res = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = (await res.json()) as {
    data?: unknown;
    errors?: { message: string }[];
  };

  if (json.errors?.length) throw new Error(json.errors[0].message);

  return json.data;
}

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
  panelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: '12px',
  },
  addButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#444',
    background: '#fff',
    border: '1px solid #ddd',
    borderRadius: '6px',
    cursor: 'pointer',
    lineHeight: 1,
  },
  newSectionForm: {
    background: '#fff',
    border: '1px solid #d0d0d0',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  nameInput: {
    flex: 1,
    padding: '5px 8px',
    fontSize: '13px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: 'inherit',
  },
  saveButton: {
    padding: '5px 12px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#fff',
    background: '#2563eb',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
  },
  cancelButton: {
    padding: '5px 10px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#555',
    background: '#f0f0f0',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
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

// ── New Section inline form ───────────────────────────────────────────────────

const NewSectionForm = ({
  onSave,
  onCancel,
  saving,
}: {
  onSave: (name: string) => Promise<void>;
  onCancel: () => void;
  saving: boolean;
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      void onSave(name.trim());
    }
    if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div style={S.newSectionForm}>
      <input
        ref={inputRef}
        style={S.nameInput}
        type="text"
        placeholder="Section name…"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={saving}
      />
      <button
        style={S.saveButton}
        onClick={() => name.trim() && void onSave(name.trim())}
        disabled={saving || !name.trim()}
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button style={S.cancelButton} onClick={onCancel} disabled={saving}>
        Cancel
      </button>
    </div>
  );
};

// ── Main component ────────────────────────────────────────────────────────────

const QuoteSectionsPanel = () => {
  const recordId = useRecordId();
  const [sections, setSections] = useState<QuoteSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetchSections = useCallback(async () => {
    if (!isDefined(recordId)) {
      setLoading(false);
      setError('No record ID available');
      return;
    }

    try {
      setError(null);
      const data = (await gql(
        `query GetQuoteSections($quoteId: UUID!) {
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
        }`,
        { quoteId: recordId },
      )) as { quoteSections?: { edges?: { node: QuoteSection }[] } };

      setSections(data?.quoteSections?.edges?.map((e) => e.node) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }

    setLoading(false);
  }, [recordId]);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  const handleCreateSection = useCallback(
    async (name: string) => {
      if (!isDefined(recordId)) return;
      setSaving(true);
      try {
        const nextPosition =
          sections.length > 0
            ? Math.max(...sections.map((s) => s.sectionPosition ?? 0)) + 1
            : 1;

        await gql(
          `mutation CreateQuoteSection($name: String!, $quoteId: UUID!, $pos: Float) {
            createOneQuoteSection(data: {
              name: $name
              quoteId: $quoteId
              sectionPosition: $pos
            }) {
              id
            }
          }`,
          { name, quoteId: recordId, pos: nextPosition },
        );

        setShowNewForm(false);
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
      setSaving(false);
    },
    [recordId, sections, fetchSections],
  );

  if (loading) {
    return <div style={S.loadingState}>Loading sections…</div>;
  }

  if (isDefined(error)) {
    return <div style={S.errorState}>Error: {error}</div>;
  }

  return (
    <div style={S.container}>
      <div style={S.panelHeader}>
        {!showNewForm && (
          <button style={S.addButton} onClick={() => setShowNewForm(true)}>
            + New Section
          </button>
        )}
      </div>

      {showNewForm && (
        <NewSectionForm
          onSave={handleCreateSection}
          onCancel={() => setShowNewForm(false)}
          saving={saving}
        />
      )}

      {sections.length === 0 ? (
        <div style={{ ...S.loadingState, color: '#bbb', fontStyle: 'italic', height: 'auto', paddingTop: '16px' }}>
          No quote sections yet
        </div>
      ) : (
        sections.map((section, idx) => (
          <SectionCard key={section.id} section={section} index={idx} />
        ))
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: QUOTE_SECTIONS_PANEL_UNIVERSAL_IDENTIFIER,
  name: 'quote-sections-panel',
  description: 'Stacked cards showing Quote Sections, Line Items, and Quote Terms',
  component: QuoteSectionsPanel,
});
