import { useCallback, useState, type CSSProperties } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  openSidePanelPage,
  SidePanelPages,
  useFrontComponentExecutionContext,
  type FrontComponentExecutionContext,
} from 'twenty-sdk/front-component';

import {
  APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
  MIN_PITCH_LENGTH,
} from 'src/modules/application/apply/constants/apply-to-brief.constants';
import {
  GENERIC_APPLY_FAILURE_MESSAGE,
  getRefusalMessage,
} from 'src/modules/application/apply/front-components/apply-to-brief/refusal-message';
import { type ApplyToBriefResult } from 'src/modules/application/apply/types/apply-to-brief.types';
import { callAppRoute } from 'src/modules/shared/front-components/call-app-route';
import { COLORS, FONT } from 'src/modules/shared/front-components/palette';

const pageStyle: CSSProperties = {
  fontFamily: FONT,
  color: COLORS.fg,
  maxWidth: '100%',
  padding: '20px 24px',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};
const titleStyle: CSSProperties = { fontSize: 16, fontWeight: 700, margin: 0 };
const labelStyle: CSSProperties = {
  fontSize: 12.5,
  color: COLORS.muted,
  lineHeight: 1.5,
};
const textareaStyle: CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  minHeight: 180,
  padding: 12,
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
  fontSize: 14,
  fontFamily: FONT,
  lineHeight: 1.5,
  outline: 'none',
  resize: 'vertical',
};
const counterStyle: CSSProperties = { fontSize: 12, color: COLORS.muted };
const errorStyle: CSSProperties = { fontSize: 13, color: COLORS.danger };
const footerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
};
const buttonStyle: CSSProperties = {
  height: 36,
  padding: '0 18px',
  borderRadius: 8,
  border: 'none',
  background: COLORS.accent,
  color: '#fff',
  fontSize: 13.5,
  fontWeight: 650,
  fontFamily: FONT,
  cursor: 'pointer',
};
const disabledButtonStyle: CSSProperties = {
  ...buttonStyle,
  opacity: 0.5,
  cursor: 'not-allowed',
};

// `recordId` is deprecated and only covers a renderer that sends no selection.
const selectBriefId = (
  context: FrontComponentExecutionContext,
): string | null => context.selectedRecordIds[0] ?? context.recordId;

const ApplyToBrief = () => {
  const briefId = useFrontComponentExecutionContext(selectBriefId);
  const [pitch, setPitch] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const pitchLength = pitch.trim().length;
  const isPitchLongEnough = pitchLength >= MIN_PITCH_LENGTH;

  const apply = useCallback(async () => {
    if (!briefId) return;
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const result = (await callAppRoute('/apply-to-brief', {
        opportunityId: briefId,
        pitch,
      })) as ApplyToBriefResult;

      if (result.ok) {
        await enqueueSnackbar({
          message: 'Application sent',
          variant: 'success',
        });
        await openSidePanelPage({
          page: SidePanelPages.ViewRecord,
          recordId: result.applicationId,
          objectNameSingular: 'application',
          resetNavigationStack: true,
        });
      } else {
        setErrorMessage(getRefusalMessage(result.reason));
      }
    } catch {
      setErrorMessage(GENERIC_APPLY_FAILURE_MESSAGE);
    } finally {
      setIsSubmitting(false);
    }
  }, [briefId, pitch]);

  if (!briefId) {
    return <div style={pageStyle}>Open a brief to apply.</div>;
  }

  return (
    <div style={pageStyle}>
      <h1 style={titleStyle}>Apply to this brief</h1>

      <label htmlFor="apply-pitch" style={labelStyle}>
        Tell the client why your team fits this brief. Twenty introduces up to 2
        partners per brief, so an application is not a guarantee of an
        introduction.
      </label>

      <textarea
        id="apply-pitch"
        style={textareaStyle}
        value={pitch}
        onChange={(event) => setPitch(event.target.value)}
        placeholder="Describe the relevant work you have done…"
        disabled={isSubmitting}
      />

      <div style={counterStyle}>
        {pitchLength} / {MIN_PITCH_LENGTH} characters minimum
      </div>

      {errorMessage && (
        <div role="alert" style={errorStyle}>
          {errorMessage}
        </div>
      )}

      <div style={footerStyle}>
        <button
          style={
            isPitchLongEnough && !isSubmitting
              ? buttonStyle
              : disabledButtonStyle
          }
          onClick={() => void apply()}
          disabled={!isPitchLongEnough || isSubmitting}
        >
          {isSubmitting ? 'Sending…' : 'Send application'}
        </button>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: APPLY_TO_BRIEF_FRONT_COMPONENT_ID,
  name: 'Apply to Brief',
  description: 'Side panel for a partner to pitch on an open brief.',
  component: ApplyToBrief,
});
