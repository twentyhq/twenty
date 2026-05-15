import { useCallback, useEffect, useState } from 'react';
import {
  AppPath,
  enqueueSnackbar,
  navigate,
} from 'twenty-sdk/front-component';

import {
  CampaignMemberPatch,
  CampaignMemberRow,
  OpportunitySearchHit,
  WorkspaceMemberSearchHit,
  searchOpportunities,
  searchWorkspaceMembers,
  updateCampaignMember,
} from 'src/utils/campaign-members-api';

// Shared inline-edit expansion used by both target tables. Click the pencil
// on a row, this card slides in below it with editors for the four "junction
// metadata" fields that aren't already inline-editable in the row:
//
//   - dateResponded         (date input, auto-saves on change)
//   - assignee              (workspaceMember search picker)
//   - convertedToOpportunity (opportunity search picker)
//   - notes                 (textarea, auto-saves on blur)
//
// Plus an "Open full record" link for any heavier work (history, comments,
// rich-text fields the textarea can't express).
//
// Sandbox constraints same as the parent components: inline styles, no
// emotion/Linaria, JSX restricted to div/span/table/input/textarea/button.
// Event values arrive on `event.detail.value`, not `event.target.value`.

const readInputValue = (e: unknown): string | null => {
  const detail = (e as { detail?: { value?: unknown } }).detail;
  return typeof detail?.value === 'string' ? detail.value : null;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

const fullName = (
  name: { firstName?: string | null; lastName?: string | null } | null,
): string => {
  if (name == null) return '';
  const first = name.firstName ?? '';
  const last = name.lastName ?? '';
  const combined = `${first} ${last}`.trim();
  return combined.length > 0 ? combined : '(no name)';
};

// Date helpers: dateResponded is stored as a full ISO timestamp, but we
// always render and accept YYYY-MM-DD (Stratum is UK-based, no MM/DD).
// We use a plain text input rather than `<input type="date">` because the
// native date input's *displayed* format follows the browser/OS locale,
// which sometimes shows MM/DD/YYYY for users with a US locale even on a
// UK site. Plain text gives us full control over the rendered format.
const YMD_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

const isoToYMD = (iso: string | null): string => {
  if (iso == null) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

type ParsedYMD =
  | { kind: 'empty' }
  | { kind: 'valid'; iso: string }
  | { kind: 'invalid' };

const parseYMD = (ymd: string): ParsedYMD => {
  const trimmed = ymd.trim();
  if (trimmed.length === 0) return { kind: 'empty' };
  const match = YMD_PATTERN.exec(trimmed);
  if (match === null) return { kind: 'invalid' };
  // Anchor at noon UTC so DST jumps can't bump us to the previous/next day
  // when the user is in a non-UTC timezone.
  const date = new Date(`${trimmed}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) return { kind: 'invalid' };
  // Re-format and compare to catch impossible dates like 2026-02-31 that
  // Date() rolls over to next month rather than rejecting.
  const yyyy = date.getUTCFullYear();
  const mm = String(date.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(date.getUTCDate()).padStart(2, '0');
  if (`${yyyy}-${mm}-${dd}` !== trimmed) return { kind: 'invalid' };
  return { kind: 'valid', iso: date.toISOString() };
};

const todayYMD = (): string => isoToYMD(new Date().toISOString());

// ─── Styles ─────────────────────────────────────────────────────────────────

const expansionCellStyle: React.CSSProperties = {
  padding: '0',
  background: '#fafafa',
  borderBottom: '1px solid #e5e7eb',
};

const expansionCardStyle: React.CSSProperties = {
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

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 600,
  color: '#6b7280',
  textTransform: 'uppercase',
  letterSpacing: '0.04em',
  marginBottom: '4px',
};

const fieldRowStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  gap: '14px',
  alignItems: 'flex-start',
};

const fieldColStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
  minWidth: 0,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '6px 10px',
  fontSize: '13px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#ffffff',
};

const textareaStyle: React.CSSProperties = {
  ...inputStyle,
  fontFamily: 'inherit',
  resize: 'vertical',
};

const buttonSecondaryStyle: React.CSSProperties = {
  background: 'transparent',
  color: '#374151',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  padding: '5px 10px',
  fontSize: '12px',
  fontWeight: 500,
  cursor: 'pointer',
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

const pickerValueStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
  background: '#eef2f7',
  borderRadius: '6px',
  padding: '6px 10px',
  fontSize: '13px',
};

const removeButtonStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  color: '#5f6368',
  fontSize: '14px',
  lineHeight: 1,
  padding: '0 6px',
};

const resultsContainerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  border: '1px solid #e5e7eb',
  borderRadius: '6px',
  marginTop: '4px',
  overflow: 'hidden',
  maxHeight: '200px',
  overflowY: 'auto',
  background: '#ffffff',
};

const resultRowStyle: React.CSSProperties = {
  background: 'transparent',
  border: 'none',
  cursor: 'pointer',
  textAlign: 'left',
  padding: '6px 10px',
  fontSize: '13px',
  color: '#1f2937',
};

const hintStyle: React.CSSProperties = {
  fontSize: '12px',
  color: '#9ca3af',
  fontStyle: 'italic',
};

const footerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '12px',
  paddingTop: '4px',
};

// ─── Component ──────────────────────────────────────────────────────────────

export type MemberEditExpansionProps = {
  row: CampaignMemberRow;
  // Column count of the parent table — used for the <td colSpan>.
  colSpan: number;
  // Called after a save succeeds so the parent can refresh its row.
  onSaved: () => void;
  // Called when the user wants to dismiss the expansion (×, Done, or save-and-close).
  onClose: () => void;
};

export const MemberEditExpansion = ({
  row,
  colSpan,
  onSaved,
  onClose,
}: MemberEditExpansionProps) => {
  // Local copies that mirror the row but track in-progress edits — typing in
  // notes shouldn't trigger a re-fetch on every keystroke; we save on blur.
  const [notes, setNotes] = useState<string>(row.notes ?? '');
  const [dateResponded, setDateResponded] = useState<string>(
    isoToYMD(row.dateResponded),
  );

  // Search state for the two pickers.
  const [assigneeSearch, setAssigneeSearch] = useState('');
  const [assigneeHits, setAssigneeHits] = useState<WorkspaceMemberSearchHit[]>([]);

  const [opportunitySearch, setOpportunitySearch] = useState('');
  const [opportunityHits, setOpportunityHits] = useState<OpportunitySearchHit[]>([]);

  // Re-seed local notes/date if the row prop changes (e.g. another
  // reload landed while the expansion was open).
  useEffect(() => {
    setNotes(row.notes ?? '');
    setDateResponded(isoToYMD(row.dateResponded));
  }, [row.id, row.notes, row.dateResponded]);

  // Debounced workspaceMember search (200ms, min 2 chars).
  useEffect(() => {
    const q = assigneeSearch.trim();
    if (q.length < 2) {
      setAssigneeHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchWorkspaceMembers(q)
        .then((r) => {
          if (!cancelled) setAssigneeHits(r);
        })
        .catch(() => {
          if (!cancelled) setAssigneeHits([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [assigneeSearch]);

  // Debounced opportunity search.
  useEffect(() => {
    const q = opportunitySearch.trim();
    if (q.length < 2) {
      setOpportunityHits([]);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(() => {
      searchOpportunities(q)
        .then((r) => {
          if (!cancelled) setOpportunityHits(r);
        })
        .catch(() => {
          if (!cancelled) setOpportunityHits([]);
        });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [opportunitySearch]);

  const save = useCallback(
    async (patch: CampaignMemberPatch, successMessage?: string): Promise<void> => {
      try {
        await updateCampaignMember(row.id, patch);
        if (successMessage != null) {
          await enqueueSnackbar({ message: successMessage, variant: 'success' });
        }
        onSaved();
      } catch (err) {
        await enqueueSnackbar({
          message: err instanceof Error ? err.message : 'Failed to save',
          variant: 'error',
        });
      }
    },
    [row.id, onSaved],
  );

  // Commit the date input on blur, not on every keystroke — typing
  // "2026-05-15" digit-by-digit goes through several invalid intermediate
  // states. Validate + save when the field loses focus or the user hits the
  // Today button.
  const commitDate = useCallback(
    async (newYMD: string): Promise<void> => {
      const parsed = parseYMD(newYMD);
      // Skip the round-trip if nothing actually changed.
      const currentYMD = isoToYMD(row.dateResponded);
      if (parsed.kind === 'empty' && currentYMD === '') return;
      if (parsed.kind === 'valid' && newYMD === currentYMD) return;

      if (parsed.kind === 'invalid') {
        await enqueueSnackbar({
          message: `Invalid date "${newYMD}". Use yyyy-mm-dd.`,
          variant: 'error',
        });
        setDateResponded(currentYMD);
        return;
      }

      await save({
        dateResponded: parsed.kind === 'valid' ? parsed.iso : null,
      });
    },
    [row.dateResponded, save],
  );

  const handleTodayClick = (): void => {
    const today = todayYMD();
    setDateResponded(today);
    void commitDate(today);
  };

  const handleClearDate = (): void => {
    setDateResponded('');
    void commitDate('');
  };

  const handleAssigneeSelect = async (hit: WorkspaceMemberSearchHit): Promise<void> => {
    setAssigneeSearch('');
    setAssigneeHits([]);
    await save({ assigneeId: hit.id }, `Assigned to ${fullName(hit.name)}`);
  };

  const handleAssigneeClear = async (): Promise<void> => {
    await save({ assigneeId: null }, 'Assignee cleared');
  };

  const handleOpportunitySelect = async (hit: OpportunitySearchHit): Promise<void> => {
    setOpportunitySearch('');
    setOpportunityHits([]);
    await save(
      { convertedToOpportunityId: hit.id, responseStatus: 'CONVERTED', dateResponded: new Date().toISOString() },
      `Linked to ${hit.name ?? 'opportunity'} and marked Converted`,
    );
  };

  const handleOpportunityClear = async (): Promise<void> => {
    await save({ convertedToOpportunityId: null }, 'Opportunity unlinked');
  };

  const handleNotesBlur = async (): Promise<void> => {
    const trimmed = notes.length === 0 ? null : notes;
    // Skip the round-trip if nothing actually changed.
    if (trimmed === (row.notes ?? null)) return;
    await save({ notes: trimmed });
  };

  return (
    <tr>
      <td style={expansionCellStyle} colSpan={colSpan}>
        <div style={expansionCardStyle}>
          <div style={headerRowStyle}>
            <span style={sectionLabelStyle}>Edit campaign member</span>
            <button
              style={buttonSecondaryStyle}
              onClick={onClose}
              title="Close edit panel"
            >
              ×
            </button>
          </div>

          <div style={fieldRowStyle}>
            {/* ───── Date responded ───── */}
            <div style={fieldColStyle}>
              <span style={sectionLabelStyle}>Date responded</span>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <input
                  style={inputStyle}
                  type="text"
                  value={dateResponded}
                  placeholder="yyyy-mm-dd"
                  onChange={(e) => {
                    const v = readInputValue(e);
                    if (v !== null) setDateResponded(v);
                  }}
                  onBlur={() => void commitDate(dateResponded)}
                />
                <button
                  style={buttonSecondaryStyle}
                  onClick={handleTodayClick}
                  title="Set to today"
                >
                  Today
                </button>
              </div>
              {dateResponded.length > 0 && (
                <button
                  style={{ ...linkButtonStyle, fontSize: '12px' }}
                  onClick={handleClearDate}
                >
                  Clear date
                </button>
              )}
            </div>

            {/* ───── Assignee ───── */}
            <div style={fieldColStyle}>
              <span style={sectionLabelStyle}>Assignee</span>
              {row.assignee != null ? (
                <div style={pickerValueStyle}>
                  <span>{fullName(row.assignee.name)}</span>
                  <button
                    style={removeButtonStyle}
                    onClick={handleAssigneeClear}
                    title="Clear assignee"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span style={hintStyle}>No assignee</span>
              )}
              <input
                style={inputStyle}
                type="text"
                value={assigneeSearch}
                onChange={(e) => {
                  const v = readInputValue(e);
                  if (v !== null) setAssigneeSearch(v);
                }}
                placeholder={
                  row.assignee != null
                    ? 'Search to replace…'
                    : 'Search by name (min 2 chars)…'
                }
              />
              {assigneeSearch.trim().length >= 2 && assigneeHits.length === 0 && (
                <span style={hintStyle}>No matches</span>
              )}
              {assigneeHits.length > 0 && (
                <div style={resultsContainerStyle}>
                  {assigneeHits.map((hit) => (
                    <button
                      key={hit.id}
                      style={resultRowStyle}
                      onClick={() => handleAssigneeSelect(hit)}
                    >
                      <span>{fullName(hit.name)}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* ───── Converted to opportunity ───── */}
            <div style={fieldColStyle}>
              <span style={sectionLabelStyle}>Converted to opportunity</span>
              {row.convertedToOpportunity != null ? (
                <div style={pickerValueStyle}>
                  <button
                    style={{ ...linkButtonStyle, fontSize: '13px' }}
                    onClick={() =>
                      navigate(AppPath.RecordShowPage, {
                        objectNameSingular: 'opportunity',
                        objectRecordId: row.convertedToOpportunity!.id,
                      })
                    }
                  >
                    {row.convertedToOpportunity.name ?? '(opportunity)'}
                  </button>
                  <button
                    style={removeButtonStyle}
                    onClick={handleOpportunityClear}
                    title="Unlink opportunity"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <span style={hintStyle}>Not converted</span>
              )}
              <input
                style={inputStyle}
                type="text"
                value={opportunitySearch}
                onChange={(e) => {
                  const v = readInputValue(e);
                  if (v !== null) setOpportunitySearch(v);
                }}
                placeholder={
                  row.convertedToOpportunity != null
                    ? 'Search to replace…'
                    : 'Search opportunities (min 2 chars)…'
                }
              />
              {opportunitySearch.trim().length >= 2 && opportunityHits.length === 0 && (
                <span style={hintStyle}>No matches</span>
              )}
              {opportunityHits.length > 0 && (
                <div style={resultsContainerStyle}>
                  {opportunityHits.map((hit) => {
                    const stage = hit.stage != null && hit.stage.length > 0 ? ` · ${hit.stage}` : '';
                    return (
                      <button
                        key={hit.id}
                        style={resultRowStyle}
                        onClick={() => handleOpportunitySelect(hit)}
                      >
                        <span>{(hit.name ?? '(no name)') + stage}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* ───── Notes (full-width row) ───── */}
          <div style={fieldColStyle}>
            <span style={sectionLabelStyle}>Notes</span>
            <textarea
              style={textareaStyle}
              rows={3}
              value={notes}
              onChange={(e) => {
                const v = readInputValue(e);
                if (v !== null) setNotes(v);
              }}
              onBlur={handleNotesBlur}
              placeholder="Notes (auto-saves when you click away)…"
            />
          </div>

          {/* ───── Footer: link to full record ───── */}
          <div style={footerStyle}>
            <button
              style={linkButtonStyle}
              onClick={() =>
                navigate(AppPath.RecordShowPage, {
                  objectNameSingular: 'campaignMember',
                  objectRecordId: row.id,
                })
              }
            >
              Open full record →
            </button>
            <button style={buttonSecondaryStyle} onClick={onClose}>
              Done
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
};
