import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';

import { SALES_NOTES_LIST_ON_COMPANY_FRONT_COMPONENT_UID } from 'src/constants/universal-identifiers';
import {
  type RelatedSalesNote,
  fetchSalesNotesForCompany,
} from 'src/utils/fetch-related-sales-notes';

// Inline styles only — Linaria/emotion break in the front-component sandbox
// (lesson #6). Keep JSX restricted to div / span / table / thead / tbody /
// tr / th / td / button which the remote-DOM renderer understands.
const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '16px 20px',
};

const headerStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  marginBottom: '12px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '8px 10px',
  borderBottom: '1px solid #eee',
  color: '#888',
  fontWeight: 500,
  fontSize: '12px',
};

const tdStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #f3f3f3',
  color: '#333',
  verticalAlign: 'top',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  color: '#1a73e8',
  cursor: 'pointer',
  fontWeight: 500,
  textAlign: 'left',
};

const statusBadgeStyle = (status: string | null): React.CSSProperties => {
  const isFinal = status === 'FINAL';
  return {
    display: 'inline-block',
    padding: '2px 8px',
    borderRadius: '10px',
    fontSize: '11px',
    fontWeight: 600,
    background: isFinal ? '#e6f4ea' : '#f1f3f4',
    color: isFinal ? '#137333' : '#5f6368',
  };
};

const emptyStyle: React.CSSProperties = {
  ...cardStyle,
  color: '#888',
  fontStyle: 'italic',
};

const formatDate = (iso: string | null): string => {
  if (iso == null) return '';
  // Trim to YYYY-MM-DD HH:MM in user's locale; the sandbox has no Intl
  // helpers configured, so keep this minimal and stable.
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const min = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const SalesNotesListOnCompany = () => {
  const companyId = useRecordId();
  const [records, setRecords] = useState<RelatedSalesNote[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof companyId !== 'string' || companyId.length === 0) {
      setRecords([]);
      return;
    }
    setRecords(null);
    setError(null);
    fetchSalesNotesForCompany(companyId)
      .then((rows) => setRecords(rows))
      .catch((err) =>
        setError(err instanceof Error ? err.message : 'Failed to load'),
      );
  }, [companyId]);

  if (error != null) {
    return (
      <div style={emptyStyle}>
        <span>Failed to load sales notes: {error}</span>
      </div>
    );
  }

  if (records == null) {
    return (
      <div style={emptyStyle}>
        <span>Loading sales notes…</span>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div style={emptyStyle}>
        <span>
          No sales notes for this company yet. Click <b>+ Sales note</b> in the
          header to create one.
        </span>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={headerStyle}>
        <span>{records.length} sales note{records.length === 1 ? '' : 's'}</span>
      </div>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Title</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Owner</th>
            <th style={thStyle}>Created</th>
          </tr>
        </thead>
        <tbody>
          {records.map((row) => (
            <tr key={row.id}>
              <td style={tdStyle}>
                <button
                  style={linkButtonStyle}
                  onClick={() =>
                    navigate(AppPath.RecordShowPage, {
                      objectNameSingular: 'salesNote',
                      objectRecordId: row.id,
                    })
                  }
                >
                  {row.name != null && row.name.length > 0
                    ? row.name
                    : '(untitled)'}
                </button>
              </td>
              <td style={tdStyle}>
                <span style={statusBadgeStyle(row.status)}>
                  {row.status ?? ''}
                </span>
              </td>
              <td style={tdStyle}>{row.ownerLabel ?? ''}</td>
              <td style={tdStyle}>{formatDate(row.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SALES_NOTES_LIST_ON_COMPANY_FRONT_COMPONENT_UID,
  name: 'sales-notes-list-on-company',
  description:
    'Lists sales notes attached to the focal Company record (via salesNote.companyId). Each row navigates to the sales note.',
  component: SalesNotesListOnCompany,
});
