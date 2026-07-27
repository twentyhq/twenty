import { useState } from 'react';
import { AppPath, enqueueSnackbar, navigate } from 'twenty-sdk/front-component';

import { COLORS, FONT } from './form-fields';

const avatarStyle = {
  width: 72,
  height: 72,
  borderRadius: '50%',
  objectFit: 'cover',
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surfaceAlt,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 24,
  color: COLORS.muted,
  flexShrink: 0,
} as const;

const buttonStyle = {
  height: 34,
  borderRadius: 8,
  border: `1px solid ${COLORS.border}`,
  background: COLORS.surface,
  color: COLORS.fg,
  fontSize: 13,
  fontWeight: 600,
  fontFamily: FONT,
  cursor: 'pointer',
  padding: '0 14px',
} as const;

// A sandboxed front-component can't read file bytes (the renderer only forwards file
// metadata across the worker boundary), so real image upload has to happen on the
// platform's native record page. This sends the partner there; on return the page
// re-fetches and shows the new photo.
export const ProfilePictureUpload = ({
  url,
  recordId,
}: {
  url: string | null;
  recordId: string;
}) => {
  const [busy, setBusy] = useState(false);

  const goToRecord = async () => {
    setBusy(true);
    try {
      await navigate(AppPath.RecordShowPage, {
        objectNameSingular: 'partner',
        objectRecordId: recordId,
      });
    } catch (error) {
      await enqueueSnackbar({
        message: error instanceof Error ? error.message : 'Could not open your record',
        variant: 'error',
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      {url ? (
        <img src={url} alt="Profile" style={avatarStyle} />
      ) : (
        <div style={avatarStyle}>🙂</div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <button style={buttonStyle} onClick={() => void goToRecord()} disabled={busy}>
          {busy ? 'Opening…' : url ? 'Change photo' : 'Add photo'}
        </button>
        <span style={{ fontSize: 11, color: COLORS.muted }}>
          Opens your record page to upload an image.
        </span>
      </div>
    </div>
  );
};
