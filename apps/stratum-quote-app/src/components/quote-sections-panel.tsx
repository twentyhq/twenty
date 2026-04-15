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

type LineItemPatch = {
  name: string;
  feeType: string;
  estimatedHours: number | null;
  hourlyRate: CurrencyAmount;
  fixedFeeAmount: CurrencyAmount;
};

type QuoteTerm = {
  id: string;
  name: string | null;
  termType: string | null;
  feePercentage: number | null;
  affectsFees: boolean | null;
};

type QuoteTermPatch = {
  name: string;
  termType: string | undefined;
  feePercentage: number | null;
  affectsFees: boolean;
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

const FEE_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'FIXED_PRICE', label: 'Fixed Price' },
  { value: 'TIME_AND_MATERIALS', label: 'T&M' },
];

const TERM_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'INDEXATION', label: 'Indexation' },
  { value: 'AD_HOC_FEE', label: 'Ad-hoc fee' },
  { value: 'PAYMENT_TERMS', label: 'Payment terms' },
  { value: 'LIABILITY_CAP', label: 'Liability cap' },
  { value: 'OUT_OF_SCOPE', label: 'Out of scope' },
  { value: 'OTHER', label: 'Other' },
];

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

const feeTypeLabel = (value: string | null): string =>
  FEE_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—';

const termTypeLabel = (value: string | null): string =>
  TERM_TYPE_OPTIONS.find((o) => o.value === value)?.label ?? value ?? '—';

// ── Event helpers ─────────────────────────────────────────────────────────────

// event.detail.value is how remote-dom serializes input values into the worker
const detailValue = (e: unknown): string =>
  (e as { detail?: { value?: string } }).detail?.value ?? '';

const detailKey = (e: unknown): string =>
  (e as { detail?: { key?: string } }).detail?.key ?? '';

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
  subsectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 16px 4px',
  },
  subsectionLabel: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#888',
    letterSpacing: '0.05em',
    textTransform: 'uppercase' as const,
  },
  smallAddBtn: {
    fontSize: '11px',
    fontWeight: 600,
    color: '#4a90e2',
    background: 'transparent',
    border: '1px solid #c3d9f5',
    borderRadius: '4px',
    padding: '2px 7px',
    cursor: 'pointer',
    lineHeight: 1.4,
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
  thNarrow: {
    padding: '6px 8px',
    width: '52px',
    borderBottom: '1px solid #efefef',
  },
  td: {
    padding: '7px 16px',
    borderBottom: '1px solid #f5f5f5',
    color: '#333',
    verticalAlign: 'middle' as const,
  },
  tdRight: {
    padding: '7px 16px',
    borderBottom: '1px solid #f5f5f5',
    color: '#333',
    textAlign: 'right' as const,
    verticalAlign: 'middle' as const,
  },
  tdNarrow: {
    padding: '4px 8px',
    borderBottom: '1px solid #f5f5f5',
    verticalAlign: 'middle' as const,
    width: '52px',
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
  editInput: {
    fontSize: '12px',
    border: 'none',
    borderBottom: '1px solid #4a90e2',
    outline: 'none',
    background: 'transparent',
    width: '100%',
    padding: '1px 2px',
    color: '#111',
    boxSizing: 'border-box' as const,
  },
  editInputRight: {
    fontSize: '12px',
    border: 'none',
    borderBottom: '1px solid #4a90e2',
    outline: 'none',
    background: 'transparent',
    width: '70px',
    padding: '1px 2px',
    color: '#111',
    textAlign: 'right' as const,
  },
  toggleBtn: (active: boolean) => ({
    fontSize: '11px',
    fontWeight: 600,
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid',
    cursor: 'pointer',
    background: active ? '#1976d2' : '#fff',
    color: active ? '#fff' : '#555',
    borderColor: active ? '#1976d2' : '#ddd',
    marginRight: '3px',
    marginBottom: '2px',
    lineHeight: 1.4,
  }),
  saveBtn: {
    fontSize: '12px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid #4a90e2',
    cursor: 'pointer',
    marginRight: '2px',
    lineHeight: 1,
    color: '#fff',
    background: '#4a90e2',
  },
  cancelBtn: {
    fontSize: '12px',
    fontWeight: 700,
    padding: '2px 6px',
    borderRadius: '3px',
    border: '1px solid #ccc',
    cursor: 'pointer',
    lineHeight: 1,
    color: '#666',
    background: '#fff',
  },
  editIconBtn: {
    fontSize: '11px',
    padding: '2px 5px',
    borderRadius: '3px',
    border: '1px solid #eee',
    cursor: 'pointer',
    color: '#aaa',
    background: 'transparent',
    lineHeight: 1,
  },
  dash: { color: '#bbb' as const },
};

// ── Line Item Row ─────────────────────────────────────────────────────────────

const LineItemRow = ({
  item,
  onUpdate,
}: {
  item: LineItem;
  onUpdate: (id: string, patch: LineItemPatch) => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [feeType, setFeeType] = useState('TIME_AND_MATERIALS');
  const [hours, setHours] = useState('');
  const [rate, setRate] = useState('');
  const [amount, setAmount] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setName(item.name ?? '');
    setFeeType(item.feeType ?? 'TIME_AND_MATERIALS');
    setHours(item.estimatedHours != null ? String(item.estimatedHours) : '');
    setRate(
      item.hourlyRate?.amountMicros != null && item.hourlyRate.amountMicros > 0
        ? String(item.hourlyRate.amountMicros / 1_000_000)
        : '',
    );
    setAmount(
      item.fixedFeeAmount?.amountMicros != null && item.fixedFeeAmount.amountMicros > 0
        ? String(item.fixedFeeAmount.amountMicros / 1_000_000)
        : '',
    );
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    const isTM = feeType === 'TIME_AND_MATERIALS';
    await onUpdate(item.id, {
      name: name.trim() !== '' ? name.trim() : (item.name ?? 'New line item'),
      feeType,
      // Server requires estimatedHours not null for T&M — default to 0 if left blank
      estimatedHours: isTM ? (hours !== '' ? parseFloat(hours) : 0) : null,
      hourlyRate: {
        amountMicros: isTM && rate !== '' ? Math.round(parseFloat(rate) * 1_000_000) : 0,
        currencyCode: item.hourlyRate?.currencyCode ?? 'GBP',
      },
      fixedFeeAmount: {
        amountMicros: !isTM && amount !== '' ? Math.round(parseFloat(amount) * 1_000_000) : 0,
        currencyCode: item.fixedFeeAmount?.currencyCode ?? 'GBP',
      },
    });
    setSaving(false);
    setEditing(false);
  };

  const onKeyDown = (e: unknown) => {
    const k = detailKey(e);
    if (k === 'Enter') void save();
    if (k === 'Escape') setEditing(false);
  };

  const isTM = feeType === 'TIME_AND_MATERIALS';

  if (editing) {
    return (
      <tr>
        <td style={S.td}>
          <input
            type="text"
            defaultValue={name}
            onChange={(e) => setName(detailValue(e))}
            onKeyDown={onKeyDown}
            disabled={saving}
            style={S.editInput}
          />
        </td>
        <td style={S.td}>
          <button
            onClick={() => setFeeType(isTM ? 'FIXED_PRICE' : 'TIME_AND_MATERIALS')}
            style={S.toggleBtn(true)}
          >
            {isTM ? 'T&M' : 'Fixed'}
          </button>
        </td>
        <td style={S.tdRight}>
          {isTM ? (
            <input
              type="number"
              defaultValue={hours}
              onChange={(e) => setHours(detailValue(e))}
              onKeyDown={onKeyDown}
              disabled={saving}
              style={S.editInputRight}
            />
          ) : (
            <span style={S.dash}>—</span>
          )}
        </td>
        <td style={S.tdRight}>
          {isTM ? (
            <input
              type="number"
              defaultValue={rate}
              onChange={(e) => setRate(detailValue(e))}
              onKeyDown={onKeyDown}
              disabled={saving}
              style={S.editInputRight}
            />
          ) : (
            <span style={S.dash}>—</span>
          )}
        </td>
        <td style={S.tdRight}>
          {!isTM ? (
            <input
              type="number"
              defaultValue={amount}
              onChange={(e) => setAmount(detailValue(e))}
              onKeyDown={onKeyDown}
              disabled={saving}
              style={S.editInputRight}
            />
          ) : (
            <span style={{ color: '#999', fontSize: '11px' }}>computed</span>
          )}
        </td>
        <td style={S.tdNarrow}>
          <button onClick={() => void save()} disabled={saving} style={S.saveBtn}>✓</button>
          <button onClick={() => setEditing(false)} style={S.cancelBtn}>✗</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td style={S.td}>{item.name ?? '—'}</td>
      <td style={S.td}>
        {isDefined(item.feeType) ? (
          <span style={S.feeTypeBadge(item.feeType)}>{feeTypeLabel(item.feeType)}</span>
        ) : (
          '—'
        )}
      </td>
      <td style={S.tdRight}>{formatHours(item.estimatedHours)}</td>
      <td style={S.tdRight}>
        {item.feeType === 'TIME_AND_MATERIALS' ? formatCurrency(item.hourlyRate) : '—'}
      </td>
      <td style={S.tdRight}>
        {item.feeType === 'TIME_AND_MATERIALS'
          ? formatCurrency(item.estimatedLineAmount ?? item.fixedFeeAmount)
          : formatCurrency(item.fixedFeeAmount ?? item.estimatedLineAmount)}
      </td>
      <td style={S.tdNarrow}>
        <button onClick={startEdit} style={S.editIconBtn}>✎</button>
      </td>
    </tr>
  );
};

// ── Line Items table ──────────────────────────────────────────────────────────

const LineItemsTable = ({
  items,
  sectionId,
  onAdd,
  onUpdate,
}: {
  items: LineItem[];
  sectionId: string;
  onAdd: (sectionId: string) => Promise<void>;
  onUpdate: (id: string, patch: LineItemPatch) => Promise<void>;
}) => {
  const [adding, setAdding] = useState(false);
  const sorted = [...items].sort(
    (a, b) => (a.lineItemPosition ?? 0) - (b.lineItemPosition ?? 0),
  );

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(sectionId);
    setAdding(false);
  };

  return (
    <>
      <div style={S.subsectionHeader}>
        <span style={S.subsectionLabel}>Line Items</span>
        <button style={S.smallAddBtn} onClick={() => void handleAdd()} disabled={adding}>
          {adding ? '…' : '+ New'}
        </button>
      </div>
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
              <th style={S.thNarrow}></th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((item) => (
              <LineItemRow key={item.id} item={item} onUpdate={onUpdate} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

// ── Quote Term Row ────────────────────────────────────────────────────────────

const QuoteTermRow = ({
  term,
  onUpdate,
}: {
  term: QuoteTerm;
  onUpdate: (id: string, patch: QuoteTermPatch) => Promise<void>;
}) => {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState('');
  const [termType, setTermType] = useState('');
  const [feePct, setFeePct] = useState('');
  const [affectsFees, setAffectsFees] = useState(false);
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setName(term.name ?? '');
    setTermType(term.termType ?? 'OTHER');
    setFeePct(term.feePercentage != null ? String(term.feePercentage) : '');
    setAffectsFees(term.affectsFees ?? false);
    setEditing(true);
  };

  const save = async () => {
    setSaving(true);
    await onUpdate(term.id, {
      name: name.trim() !== '' ? name.trim() : (term.name ?? 'New term'),
      termType: termType || undefined,
      feePercentage: feePct !== '' ? parseFloat(feePct) : null,
      affectsFees,
    });
    setSaving(false);
    setEditing(false);
  };

  const onKeyDown = (e: unknown) => {
    const k = detailKey(e);
    if (k === 'Enter') void save();
    if (k === 'Escape') setEditing(false);
  };

  if (editing) {
    return (
      <tr>
        <td style={S.td}>
          <input
            type="text"
            defaultValue={name}
            onChange={(e) => setName(detailValue(e))}
            onKeyDown={onKeyDown}
            disabled={saving}
            style={S.editInput}
          />
        </td>
        <td style={S.td}>
          <div style={{ display: 'flex', flexWrap: 'wrap' as const }}>
            {TERM_TYPE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTermType(opt.value)}
                style={S.toggleBtn(termType === opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </td>
        <td style={S.tdRight}>
          <input
            type="number"
            defaultValue={feePct}
            onChange={(e) => setFeePct(detailValue(e))}
            onKeyDown={onKeyDown}
            disabled={saving}
            style={S.editInputRight}
          />
        </td>
        <td style={S.td}>
          <button
            onClick={() => setAffectsFees(!affectsFees)}
            style={S.toggleBtn(affectsFees)}
          >
            {affectsFees ? 'Yes' : 'No'}
          </button>
        </td>
        <td style={S.tdNarrow}>
          <button onClick={() => void save()} disabled={saving} style={S.saveBtn}>✓</button>
          <button onClick={() => setEditing(false)} style={S.cancelBtn}>✗</button>
        </td>
      </tr>
    );
  }

  return (
    <tr>
      <td style={S.td}>{term.name ?? '—'}</td>
      <td style={S.td}>{termTypeLabel(term.termType)}</td>
      <td style={S.tdRight}>{formatPercent(term.feePercentage)}</td>
      <td style={S.td}>
        {term.affectsFees === true ? 'Yes' : term.affectsFees === false ? 'No' : '—'}
      </td>
      <td style={S.tdNarrow}>
        <button onClick={startEdit} style={S.editIconBtn}>✎</button>
      </td>
    </tr>
  );
};

// ── Quote Terms table ─────────────────────────────────────────────────────────

const QuoteTermsTable = ({
  terms,
  sectionId,
  onAdd,
  onUpdate,
}: {
  terms: QuoteTerm[];
  sectionId: string;
  onAdd: (sectionId: string) => Promise<void>;
  onUpdate: (id: string, patch: QuoteTermPatch) => Promise<void>;
}) => {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setAdding(true);
    await onAdd(sectionId);
    setAdding(false);
  };

  return (
    <>
      <div style={{ ...S.subsectionHeader, marginTop: '8px' }}>
        <span style={S.subsectionLabel}>Quote Terms</span>
        <button style={S.smallAddBtn} onClick={() => void handleAdd()} disabled={adding}>
          {adding ? '…' : '+ New'}
        </button>
      </div>
      {terms.length === 0 ? (
        <div style={S.emptyRow}>No quote terms</div>
      ) : (
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Description</th>
              <th style={S.th}>Term Type</th>
              <th style={S.thRight}>Fee +/−</th>
              <th style={S.th}>Affects Fees?</th>
              <th style={S.thNarrow}></th>
            </tr>
          </thead>
          <tbody>
            {terms.map((term) => (
              <QuoteTermRow key={term.id} term={term} onUpdate={onUpdate} />
            ))}
          </tbody>
        </table>
      )}
    </>
  );
};

// ── Section card ──────────────────────────────────────────────────────────────

const SectionCard = ({
  section,
  index,
  onRename,
  onAddLineItem,
  onUpdateLineItem,
  onAddQuoteTerm,
  onUpdateQuoteTerm,
}: {
  section: QuoteSection;
  index: number;
  onRename: (id: string, name: string) => Promise<void>;
  onAddLineItem: (sectionId: string) => Promise<void>;
  onUpdateLineItem: (id: string, patch: LineItemPatch) => Promise<void>;
  onAddQuoteTerm: (sectionId: string) => Promise<void>;
  onUpdateQuoteTerm: (id: string, patch: QuoteTermPatch) => Promise<void>;
}) => {
  const lineItems = section.lineItems?.edges?.map((e) => e.node) ?? [];
  const quoteTerms = section.quoteTerms?.edges?.map((e) => e.node) ?? [];
  const sectionNum = section.sectionPosition ?? index + 1;

  // Adjusted subtotal: base × (1 + sum of affectsFees term percentages / 100)
  const baseMicros = section.subtotal?.amountMicros ?? 0;
  const currencyCode = section.subtotal?.currencyCode ?? 'GBP';
  const totalPct = quoteTerms
    .filter((t) => t.affectsFees === true)
    .reduce((sum, t) => sum + (t.feePercentage ?? 0), 0);
  const adjustedMicros =
    totalPct === 0 ? baseMicros : Math.round(baseMicros * (1 + totalPct / 100));
  const adjustedSubtotal: CurrencyAmount = {
    amountMicros: adjustedMicros,
    currencyCode,
  };

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [saving, setSaving] = useState(false);

  const startEdit = () => {
    setDraft(section.name ?? '');
    setEditing(true);
  };

  const commitEdit = async () => {
    const trimmed = draft.trim();
    if (trimmed.length === 0 || trimmed === section.name) {
      setEditing(false);
      return;
    }
    setSaving(true);
    await onRename(section.id, trimmed);
    setSaving(false);
    setEditing(false);
  };

  return (
    <div style={S.sectionCard}>
      <div style={S.sectionHeader}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {editing ? (
            <input
              type="text"
              defaultValue={draft}
              onChange={(e) => setDraft(detailValue(e))}
              onKeyDown={(e) => {
                const k = detailKey(e);
                if (k === 'Enter') void commitEdit();
                if (k === 'Escape') setEditing(false);
              }}
              disabled={saving}
              style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#111',
                border: 'none',
                borderBottom: '2px solid #4a90e2',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                padding: '0',
              }}
            />
          ) : (
            <div
              style={{ ...S.sectionTitle, cursor: 'pointer' }}
              onClick={startEdit}
              title="Click to rename"
            >
              §{sectionNum} &nbsp; {section.name ?? 'Unnamed Section'}
            </div>
          )}
          {isDefined(section.serviceCategory) && (
            <div style={S.sectionMeta}>{section.serviceCategory}</div>
          )}
        </div>
        <div style={{ textAlign: 'right' as const }}>
          <div style={S.sectionSubtotal}>{formatCurrency(adjustedSubtotal)}</div>
          {totalPct !== 0 && (
            <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>
              Base {formatCurrency(section.subtotal)} · Terms {totalPct > 0 ? '+' : ''}{totalPct}%
            </div>
          )}
        </div>
      </div>

      <LineItemsTable
        items={lineItems}
        sectionId={section.id}
        onAdd={onAddLineItem}
        onUpdate={onUpdateLineItem}
      />
      <QuoteTermsTable
        terms={quoteTerms}
        sectionId={section.id}
        onAdd={onAddQuoteTerm}
        onUpdate={onUpdateQuoteTerm}
      />
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
  const [creating, setCreating] = useState(false);

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
                id name serviceCategory sectionPosition
                subtotal { amountMicros currencyCode }
                lineItems {
                  edges {
                    node {
                      id name feeType estimatedHours lineItemPosition
                      hourlyRate { amountMicros currencyCode }
                      fixedFeeAmount { amountMicros currencyCode }
                      estimatedLineAmount { amountMicros currencyCode }
                    }
                  }
                }
                quoteTerms {
                  edges {
                    node { id name termType feePercentage affectsFees }
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

  const handleRenameSection = useCallback(
    async (id: string, name: string) => {
      try {
        await gql(
          `mutation RenameQuoteSection($id: UUID!, $name: String!) {
            updateQuoteSection(id: $id, data: { name: $name }) { id name }
          }`,
          { id, name },
        );
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchSections],
  );

  const handleCreateSection = useCallback(async () => {
    if (!isDefined(recordId) || creating) return;
    setCreating(true);
    try {
      const nextPosition =
        sections.length > 0
          ? Math.max(...sections.map((s) => s.sectionPosition ?? 0)) + 1
          : 1;
      await gql(
        `mutation CreateQuoteSection($name: String!, $quoteId: UUID!, $pos: Float) {
          createQuoteSection(data: { name: $name quoteId: $quoteId sectionPosition: $pos }) { id }
        }`,
        { name: `Section ${nextPosition}`, quoteId: recordId, pos: nextPosition },
      );
      await fetchSections();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
    setCreating(false);
  }, [recordId, sections, creating, fetchSections]);

  const handleAddLineItem = useCallback(
    async (sectionId: string) => {
      try {
        const section = sections.find((s) => s.id === sectionId);
        const items = section?.lineItems?.edges?.map((e) => e.node) ?? [];
        const nextPos =
          items.length > 0
            ? Math.max(...items.map((i) => i.lineItemPosition ?? 0)) + 1
            : 1;
        await gql(
          `mutation CreateLineItem($sectionId: UUID!, $pos: Float) {
            createLineItem(data: {
              name: "New line item"
              quoteSectionId: $sectionId
              feeType: TIME_AND_MATERIALS
              lineItemPosition: $pos
              estimatedHours: 0
              hourlyRate: { amountMicros: 0, currencyCode: "GBP" }
              fixedFeeAmount: { amountMicros: 0, currencyCode: "GBP" }
            }) { id }
          }`,
          { sectionId, pos: nextPos },
        );
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [sections, fetchSections],
  );

  const handleUpdateLineItem = useCallback(
    async (id: string, patch: LineItemPatch) => {
      try {
        // feeType is a GraphQL enum — inline it directly rather than declaring a variable type
        await gql(
          `mutation UpdateLineItem(
            $id: UUID!, $name: String, $estimatedHours: Float,
            $hourlyRate: CurrencyInput, $fixedFeeAmount: CurrencyInput
          ) {
            updateLineItem(id: $id, data: {
              name: $name
              feeType: ${patch.feeType}
              estimatedHours: $estimatedHours
              hourlyRate: $hourlyRate
              fixedFeeAmount: $fixedFeeAmount
            }) { id }
          }`,
          {
            id,
            name: patch.name,
            estimatedHours: patch.estimatedHours,
            hourlyRate: patch.hourlyRate,
            fixedFeeAmount: patch.fixedFeeAmount,
          },
        );
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchSections],
  );

  const handleAddQuoteTerm = useCallback(
    async (sectionId: string) => {
      try {
        await gql(
          `mutation CreateQuoteTerm($sectionId: UUID!) {
            createQuoteTerm(data: {
              name: "New term"
              owningSectionQuotationQuoteSectionId: $sectionId
              termType: OTHER
              feePercentage: 0
              affectsFees: false
            }) { id }
          }`,
          { sectionId },
        );
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchSections],
  );

  const handleUpdateQuoteTerm = useCallback(
    async (id: string, patch: QuoteTermPatch) => {
      try {
        // termType is a GraphQL enum — inline it directly
        const termTypePart = isDefined(patch.termType) ? `termType: ${patch.termType}` : '';
        await gql(
          `mutation UpdateQuoteTerm(
            $id: UUID!, $name: String, $feePercentage: Float, $affectsFees: Boolean
          ) {
            updateQuoteTerm(id: $id, data: {
              name: $name
              ${termTypePart}
              feePercentage: $feePercentage
              affectsFees: $affectsFees
            }) { id }
          }`,
          {
            id,
            name: patch.name,
            feePercentage: patch.feePercentage,
            affectsFees: patch.affectsFees,
          },
        );
        await fetchSections();
      } catch (err) {
        setError(err instanceof Error ? err.message : String(err));
      }
    },
    [fetchSections],
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
        <button
          style={S.addButton}
          onClick={() => void handleCreateSection()}
          disabled={creating}
        >
          {creating ? 'Creating…' : '+ New Section'}
        </button>
      </div>

      {sections.length === 0 ? (
        <div
          style={{
            ...S.loadingState,
            color: '#bbb',
            fontStyle: 'italic',
            height: 'auto',
            paddingTop: '16px',
          }}
        >
          No quote sections yet
        </div>
      ) : (
        sections.map((section, idx) => (
          <SectionCard
            key={section.id}
            section={section}
            index={idx}
            onRename={handleRenameSection}
            onAddLineItem={handleAddLineItem}
            onUpdateLineItem={handleUpdateLineItem}
            onAddQuoteTerm={handleAddQuoteTerm}
            onUpdateQuoteTerm={handleUpdateQuoteTerm}
          />
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
