import { type CSSProperties, useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar, openCommandConfirmationModal } from 'twenty-sdk/front-component';

import { MY_CASE_STUDIES_FRONT_COMPONENT_ID } from 'src/constants/my-case-studies.constants';

import { callAppRoute } from './call-app-route';
import { CaseStudyCard } from './my-case-studies/case-study-card';
import {
  buildInitialRows,
  newDraftRow,
  toSaveBody,
  type CaseStudyRow,
} from './my-case-studies/case-study-rows';
import { COLORS, FONT } from './my-profile/form-fields';
import type { MyProfilePayload, SaveContentResult } from './my-profile/types';

type LoadResult = { ok: true; profile: MyProfilePayload } | { ok: false; reason: string };

const pageStyle: CSSProperties = {
  fontFamily: FONT,
  color: COLORS.fg,
  maxWidth: '100%',
  padding: '24px 28px',
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
};
const headerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  gap: 12,
};
const titleStyle: CSSProperties = { fontSize: 20, fontWeight: 700, margin: 0 };
const subtitleStyle: CSSProperties = { fontSize: 13, color: COLORS.muted, marginTop: 4 };
const addButtonStyle: CSSProperties = {
  height: 34,
  padding: '0 16px',
  borderRadius: 6,
  border: 'none',
  background: COLORS.accent,
  color: '#fff',
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
const emptyStyle: CSSProperties = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surfaceAlt,
  padding: 28,
  textAlign: 'center',
  color: COLORS.muted,
  fontSize: 14,
};
const skeletonStyle: CSSProperties = {
  height: 56,
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surfaceAlt,
  marginBottom: 12,
};
const errorStyle: CSSProperties = {
  border: `1px solid ${COLORS.border}`,
  borderRadius: 8,
  background: COLORS.surfaceAlt,
  padding: 28,
  textAlign: 'center',
  color: COLORS.muted,
  fontSize: 14,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 12,
};
const retryButtonStyle: CSSProperties = {
  height: 32,
  padding: '0 16px',
  borderRadius: 6,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
  fontSize: 13,
  fontFamily: FONT,
  cursor: 'pointer',
};

const MyCaseStudies = () => {
  const [rows, setRows] = useState<CaseStudyRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await callAppRoute('/my-partner-profile', {})) as LoadResult;
      if (res.ok) {
        setRows(buildInitialRows(res.profile.caseStudies));
        setLoadFailed(false);
      } else {
        setLoadFailed(true);
        await enqueueSnackbar({ message: `Could not load case studies: ${res.reason}`, variant: 'error' });
      }
    } catch (error) {
      setLoadFailed(true);
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to load case studies',
        variant: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const patchRow = (key: string, patch: Partial<CaseStudyRow>) =>
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));

  const handleAdd = () => {
    const draft = newDraftRow();
    setRows((prev) => [...prev, draft]);
    setExpandedKey(draft.key);
  };

  // The reconcile route takes the whole desired list, so a save persists every card's current
  // values; in the accordion you edit one at a time, so this reads as "save this card".
  const persist = useCallback(
    async (nextRows: CaseStudyRow[], successMessage: string): Promise<boolean> => {
      const res = (await callAppRoute('/save-my-partner-content', toSaveBody(nextRows))) as SaveContentResult;
      if (res.ok) {
        setRows(buildInitialRows(res.caseStudies));
        await enqueueSnackbar({ message: successMessage, variant: 'success' });
        return true;
      }
      await enqueueSnackbar({ message: res.reason, variant: 'error' });
      return false;
    },
    [],
  );

  const handleSave = async (key: string) => {
    if (loadFailed) return;
    setBusyKey(key);
    try {
      // Collapse only on success so a rejected save keeps the card open to retry.
      if (await persist(rows, 'Case study saved')) setExpandedKey(null);
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save case study',
        variant: 'error',
      });
    } finally {
      setBusyKey(null);
    }
  };

  const handleDelete = async (key: string) => {
    if (loadFailed) return;
    const target = rows.find((r) => r.key === key);
    if (!target) return;

    const confirmed = await openCommandConfirmationModal({
      title: 'Delete this case study?',
      subtitle: 'It will be removed from your public profile. This cannot be undone.',
      confirmButtonText: 'Delete',
      confirmButtonAccent: 'danger',
    });
    if (confirmed !== 'confirm') return;

    const remaining = rows.filter((r) => r.key !== key);
    // A never-saved draft: drop it locally, no server round-trip.
    if (!target.id) {
      setRows(remaining);
      return;
    }
    setBusyKey(key);
    try {
      await persist(remaining, 'Case study deleted');
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to delete case study',
        variant: 'error',
      });
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>My Case Studies</h1>
          <div style={subtitleStyle}>Showcase your work on your public partner profile.</div>
        </div>
        <button
          type="button"
          style={addButtonStyle}
          onClick={handleAdd}
          disabled={loading || loadFailed || busyKey !== null}
        >
          + Add case study
        </button>
      </div>

      {loading ? (
        <div>
          <div style={skeletonStyle} />
          <div style={skeletonStyle} />
        </div>
      ) : loadFailed ? (
        <div style={errorStyle}>
          <div>We couldn't load your case studies. Please try again.</div>
          <button type="button" style={retryButtonStyle} onClick={() => void load()}>
            Retry
          </button>
        </div>
      ) : rows.length === 0 ? (
        <div style={emptyStyle}>
          No case studies yet. Add one to show clients the work you have delivered.
        </div>
      ) : (
        <div>
          {rows.map((row) => (
            <CaseStudyCard
              key={row.key}
              row={row}
              expanded={expandedKey === row.key}
              busy={busyKey === row.key}
              onToggleExpand={() => {
                // A save/delete persists the whole list, so block switching cards mid-flight
                // to avoid clobbering another card's in-progress edits.
                if (busyKey !== null) return;
                setExpandedKey((cur) => (cur === row.key ? null : row.key));
              }}
              onChange={(patch) => patchRow(row.key, patch)}
              onSave={() => void handleSave(row.key)}
              onDelete={() => void handleDelete(row.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: MY_CASE_STUDIES_FRONT_COMPONENT_ID,
  name: 'My Case Studies',
  description: 'Self-service page for a partner to create and edit their case studies.',
  component: MyCaseStudies,
});
