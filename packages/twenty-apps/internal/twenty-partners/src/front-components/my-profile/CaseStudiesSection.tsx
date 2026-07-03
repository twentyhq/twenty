import { type CSSProperties, useState } from 'react';
import { enqueueSnackbar } from 'twenty-sdk/front-component';

import { callAppRoute } from '../call-app-route';
import { FileDrop } from './FileDrop';
import { TextAreaField, TextField, UrlField } from './fields';
import type { MyProfilePayload, SaveContentResult, SubmitContentForReviewResult } from './types';

type CaseStudiesSectionProps = {
  caseStudies: MyProfilePayload['caseStudies'];
  onSaved: (caseStudies: MyProfilePayload['caseStudies']) => void;
};

type EditableCaseStudyRow = {
  id?: string;
  name: string;
  clientName: string;
  headline: string;
  bodyMarkdown: string;
  caseStudyLink: string;
  coverImageUrl: string | null;
  status: string | null;
};

const cardStyle: CSSProperties = {
  border: '1px solid rgba(0, 0, 0, 0.1)',
  borderRadius: 6,
  padding: 16,
  marginBottom: 16,
};

const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '2px 8px',
  fontSize: 12,
  borderRadius: 999,
  background: 'rgba(0, 0, 0, 0.06)',
  marginBottom: 12,
};

const STATUS_LABELS: Record<string, string> = {
  WIP: 'Work in progress',
  INTERVIEW_SCHEDULED: 'Interview scheduled',
  UNDER_CUSTOMER_PARTNER_REVIEW: 'Under review',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

const statusLabel = (status: string | null): string =>
  status ? (STATUS_LABELS[status] ?? status) : 'Not saved yet';

const buildInitialRows = (
  caseStudies: MyProfilePayload['caseStudies'],
): EditableCaseStudyRow[] =>
  caseStudies.map((row) => ({
    id: row.id,
    name: row.name ?? '',
    clientName: row.clientName ?? '',
    headline: row.headline ?? '',
    bodyMarkdown: row.bodyMarkdown ?? '',
    caseStudyLink: row.caseStudyLink ?? '',
    coverImageUrl: row.coverImageUrl,
    status: row.status,
  }));

const buildSaveBody = (rows: EditableCaseStudyRow[]): Record<string, unknown> => ({
  caseStudies: rows.map((row) => ({
    id: row.id,
    name: row.name,
    clientName: row.clientName,
    headline: row.headline,
    bodyMarkdown: row.bodyMarkdown,
    caseStudyLink: row.caseStudyLink,
  })),
});

export const CaseStudiesSection = ({ caseStudies, onSaved }: CaseStudiesSectionProps) => {
  const [rows, setRows] = useState<EditableCaseStudyRow[]>(() => buildInitialRows(caseStudies));
  const [saving, setSaving] = useState(false);
  const [submittingId, setSubmittingId] = useState<string | null>(null);

  const updateRow = <K extends keyof EditableCaseStudyRow>(
    index: number,
    key: K,
    value: EditableCaseStudyRow[K],
  ) => {
    setRows((previous) =>
      previous.map((row, rowIndex) => (rowIndex === index ? { ...row, [key]: value } : row)),
    );
  };

  const handleAdd = () => {
    setRows((previous) => [
      ...previous,
      {
        name: '',
        clientName: '',
        headline: '',
        bodyMarkdown: '',
        caseStudyLink: '',
        coverImageUrl: null,
        status: null,
      },
    ]);
  };

  const handleRemove = (index: number) => {
    setRows((previous) => previous.filter((_, rowIndex) => rowIndex !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = (await callAppRoute(
        '/save-my-partner-content',
        buildSaveBody(rows),
      )) as SaveContentResult;

      if (result.ok) {
        await enqueueSnackbar({ message: 'Case studies saved', variant: 'success' });
        onSaved(result.caseStudies);
        setRows(buildInitialRows(result.caseStudies));
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to save case studies',
        variant: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async (index: number) => {
    const row = rows[index];
    if (!row?.id) return;
    const recordId = row.id;

    setSubmittingId(recordId);
    try {
      const result = (await callAppRoute('/submit-partner-content-for-review', {
        recordId,
      })) as SubmitContentForReviewResult;

      if (result.ok) {
        updateRow(index, 'status', result.status);
        await enqueueSnackbar({ message: 'Submitted for review', variant: 'success' });
      } else {
        await enqueueSnackbar({ message: result.reason, variant: 'error' });
      }
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Failed to submit for review',
        variant: 'error',
      });
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div>
      {rows.map((row, index) => (
        <div key={row.id ?? `new-${index}`} style={cardStyle}>
          <span style={badgeStyle}>{statusLabel(row.status)}</span>

          <TextField
            label="Name"
            value={row.name}
            onChange={(value) => updateRow(index, 'name', value)}
          />
          <TextField
            label="Client name"
            value={row.clientName}
            onChange={(value) => updateRow(index, 'clientName', value)}
          />
          <TextField
            label="Headline"
            value={row.headline}
            onChange={(value) => updateRow(index, 'headline', value)}
          />
          <TextAreaField
            label="Body (markdown)"
            value={row.bodyMarkdown}
            onChange={(value) => updateRow(index, 'bodyMarkdown', value)}
            rows={6}
          />
          <UrlField
            label="Case study link"
            value={row.caseStudyLink || null}
            onChange={(value) => updateRow(index, 'caseStudyLink', value ?? '')}
          />

          {row.id ? (
            <FileDrop
              label="Cover image"
              currentUrl={row.coverImageUrl}
              target="caseStudyCover"
              recordId={row.id}
              onUploaded={(url) => updateRow(index, 'coverImageUrl', url)}
            />
          ) : (
            <p style={{ opacity: 0.5, fontSize: 13, marginBottom: 16 }}>
              Save first to add a cover image.
            </p>
          )}

          <div style={{ display: 'flex', gap: 8 }}>
            {row.id && row.status === 'WIP' ? (
              <button
                type="button"
                onClick={() => handleSubmitForReview(index)}
                disabled={submittingId === row.id}
              >
                {submittingId === row.id ? 'Submitting…' : 'Submit for review'}
              </button>
            ) : null}
            <button type="button" onClick={() => handleRemove(index)}>
              Remove
            </button>
          </div>
        </div>
      ))}

      <button type="button" onClick={handleAdd} style={{ marginBottom: 12 }}>
        Add case study
      </button>

      <div>
        <button type="button" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>
    </div>
  );
};
