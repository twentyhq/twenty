import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
  useRecordId,
} from 'twenty-sdk/front-component';

import { MemberEditExpansion } from 'src/components/member-edit-expansion';
import { CAMPAIGN_PEOPLE_TARGETS_FRONT_COMPONENT_UID } from 'src/constants/universal-identifiers';
import {
  CampaignMemberRow,
  PersonRow,
  ResponseStatus,
  TouchType,
  createCampaignMember,
  fetchCampaignMembersByVariant,
  searchPeople,
  updateCampaignMemberResponseStatus,
  updateCampaignMemberTouchType,
} from 'src/utils/campaign-members-api';

// Inline styles only — Linaria/emotion break in the front-component sandbox.
// JSX restricted to div / span / table / thead / tbody / tr / th / td /
// input / select / button. No <b>, <strong>, <em>, <i> — use span styles.
//
// Input events: `e.detail.value`, NOT `e.target.value` (remote-DOM proxy).

const readInputValue = (e: unknown): string | null => {
  const detail = (e as { detail?: { value?: unknown } }).detail;
  return typeof detail?.value === 'string' ? detail.value : null;
};

// ─── SELECT option lists (mirror 020-campaigns.py) ──────────────────────────

const RESPONSE_STATUSES: { value: ResponseStatus; label: string; bg: string; fg: string }[] = [
  { value: 'TARGETED',     label: 'Targeted',     bg: '#e0f2fe', fg: '#075985' },
  { value: 'CONTACTED',    label: 'Contacted',    bg: '#dbeafe', fg: '#1e40af' },
  { value: 'ENGAGED',      label: 'Engaged',      bg: '#cffafe', fg: '#155e75' },
  { value: 'RESPONDED',    label: 'Responded',    bg: '#d1fae5', fg: '#065f46' },
  { value: 'CONVERTED',    label: 'Converted',    bg: '#dcfce7', fg: '#166534' },
  { value: 'UNSUBSCRIBED', label: 'Unsubscribed', bg: '#fee2e2', fg: '#991b1b' },
];

const TOUCH_TYPES: { value: TouchType; label: string }[] = [
  { value: 'EMAIL',   label: 'Email' },
  { value: 'CALL',    label: 'Call' },
  { value: 'MEETING', label: 'Meeting' },
  { value: 'MAIL',    label: 'Mail' },
  { value: 'EVENT',   label: 'Event' },
  { value: 'OTHER',   label: 'Other' },
];

// ─── Styles ─────────────────────────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '12px',
  padding: '16px 20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '14px',
};

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
};

const headerLabelStyle: React.CSSProperties = {
  fontSize: '12px',
  fontWeight: 600,
  color: '#666',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const statBarStyle: React.CSSProperties = {
  display: 'flex',
  gap: '14px',
  fontSize: '12px',
  color: '#374151',
  flexWrap: 'wrap',
};

const statChipStyle = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  padding: '4px 10px',
  borderRadius: '12px',
  background: bg,
  color: fg,
  fontWeight: 500,
});

const tableWrapStyle: React.CSSProperties = {
  maxHeight: '60vh',
  overflowY: 'auto',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
};

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: '13px',
};

const theadStyle: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: '#f9fafb',
  zIndex: 1,
};

const thStyle: React.CSSProperties = {
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #e5e7eb',
  color: '#6b7280',
  fontWeight: 500,
  fontSize: '11.5px',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
};

const tdStyle: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #f3f4f6',
  color: '#1f2937',
  verticalAlign: 'middle',
};

const linkButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  padding: 0,
  color: '#1a73e8',
  cursor: 'pointer',
  fontWeight: 500,
  textAlign: 'left',
  fontSize: '13px',
};

const subTextStyle: React.CSSProperties = {
  fontSize: '11.5px',
  color: '#6b7280',
};

const statusBadgeStyle = (status: ResponseStatus | null): React.CSSProperties => {
  const match = RESPONSE_STATUSES.find((s) => s.value === status);
  return {
    display: 'inline-block',
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '11.5px',
    fontWeight: 600,
    background: match?.bg ?? '#f1f5f9',
    color: match?.fg ?? '#475569',
    textTransform: 'none',
  };
};

const selectStyle: React.CSSProperties = {
  fontSize: '12px',
  padding: '3px 6px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  background: '#ffffff',
  color: '#1f2937',
  cursor: 'pointer',
};

const addRowStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '8px',
  border: '1px solid #e5e7eb',
  borderRadius: '8px',
  padding: '10px 12px',
  background: '#f9fafb',
};

const searchInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: '13px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  outline: 'none',
  boxSizing: 'border-box',
};

const searchResultRowStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '6px 10px',
  fontSize: '13px',
  color: '#1f2937',
  borderRadius: '4px',
};

const buttonStyle: React.CSSProperties = {
  background: '#1a73e8',
  color: '#ffffff',
  border: 'none',
  borderRadius: '6px',
  padding: '7px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};

const buttonSecondaryStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '6px 12px',
  fontSize: '13px',
  fontWeight: 500,
  cursor: 'pointer',
};

const emptyStyle: React.CSSProperties = {
  padding: '24px 16px',
  textAlign: 'center',
  color: '#6b7280',
  fontStyle: 'italic',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic',
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const fullName = (name: { firstName?: string | null; lastName?: string | null } | null): string => {
  if (name == null) return '';
  const first = name.firstName ?? '';
  const last = name.lastName ?? '';
  const combined = `${first} ${last}`.trim();
  return combined.length > 0 ? combined : '(no name)';
};

const formatDate = (iso: string | null): string => {
  if (iso == null) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

// ─── Component ──────────────────────────────────────────────────────────────

const PEOPLE_COLUMN_COUNT = 9; // Person, Status, Touch, Added, Responded, Assignee, Opportunity, Notes, Edit

const pencilButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '4px 8px',
  fontSize: '12px',
  cursor: 'pointer',
  color: '#374151',
};

const pencilButtonActiveStyle: React.CSSProperties = {
  ...pencilButtonStyle,
  background: '#1a73e8',
  color: '#ffffff',
  borderColor: '#1a73e8',
};

const CampaignPeopleTargets = () => {
  const campaignId = useRecordId();
  const [rows, setRows] = useState<CampaignMemberRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [isAdding, setIsAdding] = useState(false);
  const [search, setSearch] = useState('');
  const [hits, setHits] = useState<PersonRow[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const [expandedMemberId, setExpandedMemberId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    if (typeof campaignId !== 'string' || campaignId.length === 0) {
      setRows([]);
      return;
    }
    setRows(null);
    setError(null);
    try {
      const out = await fetchCampaignMembersByVariant(campaignId, 'person');
      setRows(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    }
  }, [campaignId]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Debounced search — min 2 chars, 200ms. Excludes Persons who are already
  // a target on this campaign so reps can't double-add.
  const existingPersonIds = useMemo(
    () =>
      (rows ?? [])
        .map((r) => r.targetPerson?.id ?? null)
        .filter((id): id is string => typeof id === 'string'),
    [rows],
  );

  useEffect(() => {
    if (!isAdding) {
      setHits([]);
      return;
    }
    const q = search.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchPeople(q, existingPersonIds)
        .then((r) => {
          if (!cancelled) setHits(r);
        })
        .catch(() => {
          if (!cancelled) setHits([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, isAdding, existingPersonIds]);

  const counts = useMemo(() => {
    const c: Record<ResponseStatus, number> = {
      TARGETED: 0,
      CONTACTED: 0,
      ENGAGED: 0,
      RESPONDED: 0,
      CONVERTED: 0,
      UNSUBSCRIBED: 0,
    };
    for (const r of rows ?? []) {
      if (r.responseStatus != null) c[r.responseStatus] += 1;
    }
    return c;
  }, [rows]);

  const handleAddPerson = async (person: PersonRow): Promise<void> => {
    if (submitting || typeof campaignId !== 'string' || campaignId.length === 0) {
      return;
    }
    setSubmitting(true);
    try {
      await createCampaignMember({
        campaignId,
        variant: 'person',
        targetId: person.id,
      });
      await enqueueSnackbar({
        message: `Added ${fullName(person.name)} to campaign`,
        variant: 'success',
      });
      setSearch('');
      setHits([]);
      await reload();
    } catch (err) {
      await enqueueSnackbar({
        message: err instanceof Error ? err.message : 'Failed to add person',
        variant: 'error',
      });
    }
    setSubmitting(false);
  };

  const handleStatusChange = async (
    memberId: string,
    nextStatus: ResponseStatus,
  ): Promise<void> => {
    // Optimistic update so the table reflects the choice immediately. On
    // failure we reload to revert.
    setRows(
      (prev) =>
        prev?.map((r) =>
          r.id === memberId ? { ...r, responseStatus: nextStatus } : r,
        ) ?? null,
    );
    try {
      await updateCampaignMemberResponseStatus(memberId, nextStatus);
      // If the mutation auto-stamped dateResponded, reload to pick it up.
      if (nextStatus === 'RESPONDED' || nextStatus === 'CONVERTED') {
        await reload();
      }
    } catch (err) {
      await enqueueSnackbar({
        message: err instanceof Error ? err.message : 'Failed to update status',
        variant: 'error',
      });
      await reload();
    }
  };

  const handleTouchChange = async (
    memberId: string,
    nextTouch: TouchType,
  ): Promise<void> => {
    setRows(
      (prev) =>
        prev?.map((r) =>
          r.id === memberId ? { ...r, touchType: nextTouch } : r,
        ) ?? null,
    );
    try {
      await updateCampaignMemberTouchType(memberId, nextTouch);
    } catch (err) {
      await enqueueSnackbar({
        message: err instanceof Error ? err.message : 'Failed to update touch type',
        variant: 'error',
      });
      await reload();
    }
  };

  if (error != null) {
    return (
      <div style={cardStyle}>
        <span style={emptyStyle}>Failed to load people targets: {error}</span>
      </div>
    );
  }

  if (rows == null) {
    return (
      <div style={cardStyle}>
        <span style={emptyStyle}>Loading…</span>
      </div>
    );
  }

  return (
    <div style={cardStyle}>
      <div style={headerRowStyle}>
        <span style={headerLabelStyle}>
          {rows.length} people target{rows.length === 1 ? '' : 's'}
        </span>
        {!isAdding && (
          <button
            style={buttonStyle}
            disabled={submitting}
            onClick={() => setIsAdding(true)}
          >
            + Add Person
          </button>
        )}
      </div>

      {rows.length > 0 && (
        <div style={statBarStyle}>
          {RESPONSE_STATUSES.map((s) =>
            counts[s.value] > 0 ? (
              <span key={s.value} style={statChipStyle(s.bg, s.fg)}>
                <span>{s.label}</span>
                <span style={{ fontWeight: 700 }}>{counts[s.value]}</span>
              </span>
            ) : null,
          )}
        </div>
      )}

      {isAdding && (
        <div style={addRowStyle}>
          <input
            style={searchInputStyle}
            type="text"
            value={search}
            onChange={(e) => {
              const v = readInputValue(e);
              if (v !== null) setSearch(v);
            }}
            placeholder="Search People by name or job title (min 2 chars)…"
            disabled={submitting}
          />

          {search.trim().length >= 2 && hits.length === 0 && (
            <span style={hintStyle}>No matching people found</span>
          )}

          {hits.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '2px',
                maxHeight: '240px',
                overflowY: 'auto',
              }}
            >
              {hits.map((p) => {
                const company = p.company?.name ?? '';
                const job = p.jobTitle ?? '';
                const meta = [job, company].filter((s) => s.length > 0).join(' · ');
                return (
                  <button
                    key={p.id}
                    style={searchResultRowStyle}
                    disabled={submitting}
                    onClick={() => handleAddPerson(p)}
                  >
                    <span style={{ display: 'flex', flexDirection: 'column' }}>
                      <span>{fullName(p.name)}</span>
                      {meta.length > 0 && <span style={subTextStyle}>{meta}</span>}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <button
              style={buttonSecondaryStyle}
              disabled={submitting}
              onClick={() => {
                setIsAdding(false);
                setSearch('');
                setHits([]);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {rows.length === 0 ? (
        <span style={emptyStyle}>
          No people targets yet. Click <span style={{ fontWeight: 700 }}>+ Add Person</span> above.
        </span>
      ) : (
        <div style={tableWrapStyle}>
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={thStyle}>Person</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Touch</th>
                <th style={thStyle}>Added</th>
                <th style={thStyle}>Responded</th>
                <th style={thStyle}>Assignee</th>
                <th style={thStyle}>Opportunity</th>
                <th style={thStyle}>Notes</th>
                <th style={thStyle}>Edit</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const person = r.targetPerson;
                if (person == null) return null;
                const company = person.company?.name ?? '';
                const job = person.jobTitle ?? '';
                const personMeta = [job, company].filter((s) => s.length > 0).join(' · ');
                const opp = r.convertedToOpportunity;
                const notes = r.notes ?? '';
                const truncatedNotes = notes.length > 80 ? `${notes.slice(0, 77)}…` : notes;
                const isExpanded = expandedMemberId === r.id;
                return (
                  <Fragment key={r.id}>
                  <tr>
                    <td style={tdStyle}>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button
                          style={linkButtonStyle}
                          onClick={() =>
                            navigate(AppPath.RecordShowPage, {
                              objectNameSingular: 'person',
                              objectRecordId: person.id,
                            })
                          }
                        >
                          {fullName(person.name)}
                        </button>
                        {personMeta.length > 0 && (
                          <span style={subTextStyle}>{personMeta}</span>
                        )}
                      </div>
                    </td>
                    <td style={tdStyle}>
                      <select
                        style={{
                          ...selectStyle,
                          ...statusBadgeStyle(r.responseStatus),
                          paddingRight: '20px',
                        }}
                        value={r.responseStatus ?? ''}
                        onChange={(e) => {
                          const v = readInputValue(e);
                          if (v !== null && v.length > 0) {
                            void handleStatusChange(r.id, v as ResponseStatus);
                          }
                        }}
                      >
                        {r.responseStatus == null && <option value="">—</option>}
                        {RESPONSE_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <select
                        style={selectStyle}
                        value={r.touchType ?? ''}
                        onChange={(e) => {
                          const v = readInputValue(e);
                          if (v !== null && v.length > 0) {
                            void handleTouchChange(r.id, v as TouchType);
                          }
                        }}
                      >
                        <option value="">—</option>
                        {TOUCH_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td style={tdStyle}>
                      <span style={subTextStyle}>{formatDate(r.dateAdded)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={subTextStyle}>{formatDate(r.dateResponded)}</span>
                    </td>
                    <td style={tdStyle}>
                      <span style={subTextStyle}>{fullName(r.assignee?.name ?? null)}</span>
                    </td>
                    <td style={tdStyle}>
                      {opp != null ? (
                        <button
                          style={linkButtonStyle}
                          onClick={() =>
                            navigate(AppPath.RecordShowPage, {
                              objectNameSingular: 'opportunity',
                              objectRecordId: opp.id,
                            })
                          }
                        >
                          {opp.name ?? '(opportunity)'}
                        </button>
                      ) : (
                        <span style={subTextStyle}>—</span>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={subTextStyle} title={notes}>
                        {truncatedNotes.length > 0 ? truncatedNotes : '—'}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <button
                        style={isExpanded ? pencilButtonActiveStyle : pencilButtonStyle}
                        onClick={() =>
                          setExpandedMemberId(isExpanded ? null : r.id)
                        }
                        title={isExpanded ? 'Close edit panel' : 'Edit details'}
                      >
                        ✎
                      </button>
                    </td>
                  </tr>
                  {isExpanded && (
                    <MemberEditExpansion
                      row={r}
                      colSpan={PEOPLE_COLUMN_COUNT}
                      onSaved={() => void reload()}
                      onClose={() => setExpandedMemberId(null)}
                    />
                  )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: CAMPAIGN_PEOPLE_TARGETS_FRONT_COMPONENT_UID,
  name: 'campaign-people-targets',
  description:
    'Scrollable table of CampaignMember rows whose target is a Person, scoped to the focal Campaign. Inline edit of responseStatus and touchType, "+ Add Person" picker, click row to open the CampaignMember record for full edit.',
  component: CampaignPeopleTargets,
});
