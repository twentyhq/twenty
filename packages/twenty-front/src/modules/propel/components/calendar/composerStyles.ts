/* oxlint-disable twenty/no-hardcoded-colors -- the backdrop scrim (black), the
   over-limit alarm red, and the network-preview brand colors are semantic/external
   constants with no theme token (mirrored from §7 and each platform's brand);
   everything else reads --mantine-* bridge tokens. */
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FAILED_FILL, PULSE_RED } from '@/propel/lib/socialCalendarConfig';

// Styling for the compose surface (S3). The composer rides the same Mantine token
// bridge (PropelMantineProvider) as the detail drawer so light/dark match the CRM.
// Per §15 only transform + opacity animate, hover is gated, and reduced-motion
// drops movement (handled in the component via framer-motion + the query below).

// Full-viewport overlay host that right-aligns the panel — same pattern as the
// detail drawer so the calendar→detail→compose flow reads as one surface.
export const StyledComposerOverlay = styled(motion.div)`
  display: flex;
  inset: 0;
  justify-content: flex-end;
  position: fixed;
  z-index: 1001;
`;

export const StyledComposerBackdrop = styled.div`
  background: color-mix(in srgb, #000 44%, transparent);
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

// The composer panel — wider than the detail drawer to fit the two-pane layout.
// Collapses to a single column on narrow viewports.
export const StyledComposerPanel = styled.div`
  --failed-fill: ${FAILED_FILL};
  --pulse-red: ${PULSE_RED};

  background: var(--mantine-color-body);
  border-left: 1px solid var(--mantine-color-default-border);
  box-shadow: -16px 0 48px -24px rgba(0, 0, 0, 0.45);
  display: flex;
  flex-direction: column;
  height: 100%;
  max-width: 100vw;
  overflow: hidden;
  position: relative;
  width: min(880px, 100vw);
  will-change: transform;

  /* Header (title + close) and footer (actions) pinned; the two panes scroll. */
  .propel-composer-header {
    align-items: center;
    border-bottom: 1px solid var(--mantine-color-default-border);
    display: flex;
    flex: none;
    gap: 12px;
    justify-content: space-between;
    padding: 14px 20px;
  }

  .propel-composer-body {
    display: flex;
    flex: 1;
    min-height: 0;
  }

  /* LEFT = the form; RIGHT = the live preview. */
  .propel-composer-form {
    flex: 1 1 0;
    min-width: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px 20px 8px;
  }
  .propel-composer-preview {
    background: color-mix(in srgb, var(--mantine-color-text) 3%, transparent);
    border-left: 1px solid var(--mantine-color-default-border);
    flex: 0 0 360px;
    min-width: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 18px 18px 24px;
  }

  /* On a narrow panel, stack the preview under the form. */
  @media (max-width: 760px) {
    .propel-composer-body {
      flex-direction: column;
    }
    .propel-composer-preview {
      border-left: none;
      border-top: 1px solid var(--mantine-color-default-border);
      flex: none;
    }
  }

  .propel-field + .propel-field {
    margin-top: 18px;
  }
  .propel-field-label {
    color: var(--mantine-color-dimmed);
    display: block;
    font-size: 11.5px;
    font-weight: 700;
    letter-spacing: 0.03em;
    margin-bottom: 8px;
    text-transform: uppercase;
  }

  /* Channel toggle chips. */
  .propel-chip-row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .propel-chip {
    align-items: center;
    background: var(--mantine-color-body);
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 999px;
    cursor: pointer;
    display: inline-flex;
    font-size: 12.5px;
    font-weight: 600;
    gap: 6px;
    padding: 6px 12px;
    transition:
      background 160ms,
      border-color 160ms,
      color 160ms;
    user-select: none;
  }
  .propel-chip[data-disabled='true'] {
    cursor: not-allowed;
    opacity: 0.5;
  }
  .propel-chip[data-on='true'] {
    background: color-mix(in srgb, var(--chip-color) 14%, transparent);
    border-color: var(--chip-color);
    color: var(--mantine-color-text);
  }
  .propel-chip:active:not([data-disabled='true']) {
    transform: scale(0.97);
  }

  /* Per-network character counter rows. */
  .propel-counter-row {
    align-items: center;
    display: flex;
    font-size: 11px;
    gap: 6px;
    justify-content: space-between;
  }
  .propel-counter-row + .propel-counter-row {
    margin-top: 3px;
  }
  .propel-counter-row[data-level='near'] {
    color: #B8860B;
  }
  .propel-counter-row[data-level='over'] {
    color: var(--failed-fill);
    font-weight: 700;
  }
  .propel-counter-row[data-level='ok'] {
    color: var(--mantine-color-dimmed);
  }

  /* Media carousel. */
  .propel-media-strip {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .propel-media-tile {
    aspect-ratio: 1 / 1;
    background: color-mix(in srgb, var(--mantine-color-text) 6%, transparent);
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 10px;
    cursor: grab;
    flex: none;
    height: 78px;
    overflow: hidden;
    position: relative;
    width: 78px;
  }
  .propel-media-tile[data-dragging='true'] {
    cursor: grabbing;
    z-index: 2;
  }
  .propel-media-tile[data-dropbefore='true'] {
    box-shadow: -3px 0 0 0 var(--pulse-red);
  }
  .propel-media-tile img,
  .propel-media-tile video {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
  .propel-media-tile--uploading {
    align-items: center;
    color: var(--mantine-color-dimmed);
    display: flex;
    font-size: 10px;
    justify-content: center;
    text-align: center;
  }
  .propel-media-tile--error {
    align-items: center;
    border-color: var(--failed-fill);
    color: var(--failed-fill);
    display: flex;
    font-size: 9.5px;
    justify-content: center;
    padding: 4px;
    text-align: center;
    word-break: break-word;
  }
  .propel-media-remove {
    align-items: center;
    background: rgba(0, 0, 0, 0.55);
    border: none;
    border-radius: 6px;
    color: #fff;
    cursor: pointer;
    display: flex;
    height: 20px;
    justify-content: center;
    padding: 0;
    position: absolute;
    right: 3px;
    top: 3px;
    width: 20px;
  }
  /* Add-tile (browse / drop zone). */
  .propel-media-add {
    align-items: center;
    background: transparent;
    border: 1.5px dashed var(--mantine-color-default-border);
    border-radius: 10px;
    color: var(--mantine-color-dimmed);
    cursor: pointer;
    display: flex;
    flex: none;
    flex-direction: column;
    font-size: 10px;
    gap: 2px;
    height: 78px;
    justify-content: center;
    transition: border-color 160ms, color 160ms;
    width: 78px;
  }
  .propel-media-add[data-dragover='true'] {
    border-color: var(--pulse-red);
    color: var(--mantine-color-text);
  }

  /* Permit badge. */
  .propel-permit-badge {
    align-items: center;
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 9px;
    display: flex;
    gap: 8px;
    margin-top: 8px;
    padding: 8px 10px;
  }

  /* Schedule preset chips. */
  .propel-preset-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    margin-top: 8px;
  }
  .propel-preset {
    background: var(--mantine-color-body);
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 8px;
    color: var(--mantine-color-text);
    cursor: pointer;
    font-size: 11.5px;
    font-weight: 600;
    padding: 5px 10px;
    transition: background 140ms;
  }
  .propel-preset:active {
    transform: scale(0.97);
  }

  /* Validation summary line. */
  .propel-validation {
    align-items: flex-start;
    color: var(--mantine-color-dimmed);
    display: flex;
    font-size: 11.5px;
    gap: 6px;
    line-height: 1.4;
  }

  /* Server error envelope (inline). */
  .propel-save-error {
    background: color-mix(in srgb, var(--failed-fill) 10%, transparent);
    border: 1px solid color-mix(in srgb, var(--failed-fill) 40%, transparent);
    border-radius: 10px;
    color: var(--mantine-color-text);
    font-size: 12px;
    margin-top: 12px;
    padding: 10px 12px;
  }

  /* Footer. */
  .propel-composer-footer {
    align-items: center;
    background: var(--mantine-color-body);
    border-top: 1px solid var(--mantine-color-default-border);
    display: flex;
    flex: none;
    gap: 10px;
    justify-content: flex-end;
    padding: 12px 20px;
  }

  @media (hover: hover) and (pointer: fine) {
    .propel-chip:hover:not([data-disabled='true']) {
      border-color: var(--chip-color);
    }
    .propel-preset:hover {
      background: color-mix(in srgb, var(--mantine-color-text) 5%, transparent);
    }
    .propel-media-add:hover {
      border-color: var(--pulse-red);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .propel-chip,
    .propel-preset,
    .propel-media-tile {
      transition: none;
    }
  }
`;

// ── Live preview card (right pane) ──────────────────────────────────────────
// A faithful-enough mock of a social post on the selected network. Renders the
// page avatar, the media (IG square crop / FB landscape), and the caption with the
// network's truncation. Brand colors here are intentional (mirror each platform).
export const StyledPreviewCard = styled.div`
  background: var(--mantine-color-body);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: 12px;
  overflow: hidden;

  .propel-preview-head {
    align-items: center;
    display: flex;
    gap: 9px;
    padding: 10px 12px;
  }
  .propel-preview-avatar {
    align-items: center;
    background: var(--avatar-color, var(--pulse-red, #e0144c));
    border-radius: 50%;
    color: #fff;
    display: flex;
    flex: none;
    font-size: 13px;
    font-weight: 700;
    height: 34px;
    justify-content: center;
    width: 34px;
  }
  .propel-preview-handle {
    color: var(--mantine-color-text);
    font-size: 13px;
    font-weight: 600;
    line-height: 1.1;
  }
  .propel-preview-sub {
    color: var(--mantine-color-dimmed);
    font-size: 11px;
  }

  /* Media frame. IG = square; FB/LinkedIn/TikTok = 1.91:1 landscape. */
  .propel-preview-media {
    background: color-mix(in srgb, var(--mantine-color-text) 8%, transparent);
    overflow: hidden;
    position: relative;
    width: 100%;
  }
  .propel-preview-media[data-ratio='square'] {
    aspect-ratio: 1 / 1;
  }
  .propel-preview-media[data-ratio='landscape'] {
    aspect-ratio: 1.91 / 1;
  }
  .propel-preview-media[data-ratio='portrait'] {
    aspect-ratio: 9 / 16;
    max-height: 360px;
  }
  .propel-preview-media img,
  .propel-preview-media video {
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
  .propel-preview-media--empty {
    align-items: center;
    color: var(--mantine-color-dimmed);
    display: flex;
    font-size: 11px;
    justify-content: center;
  }

  .propel-preview-caption {
    color: var(--mantine-color-text);
    font-size: 13px;
    line-height: 1.45;
    padding: 11px 12px 13px;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .propel-preview-more {
    color: var(--mantine-color-dimmed);
    cursor: default;
  }
  .propel-preview-empty-caption {
    color: var(--mantine-color-dimmed);
    font-style: italic;
  }
`;
