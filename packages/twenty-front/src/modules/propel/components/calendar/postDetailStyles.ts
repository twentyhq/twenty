/* oxlint-disable twenty/no-hardcoded-colors -- the backdrop scrim (black) and the
   FAILED status red are semantic/external constants with no theme token, mirrored
   from the pill status language (§7); everything else reads --mantine-* tokens. */
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { FAILED_FILL, PULSE_RED } from '@/propel/lib/socialCalendarConfig';

// Styling for the post-detail drawer (S2). All colors read Twenty's `--mantine-*`
// bridge tokens (via PropelMantineProvider) so the panel matches the CRM in light
// + dark. Motion (enter/exit/stagger) is driven by framer-motion in the component;
// this stylesheet owns only the static look + the PUBLISHING breathing pulse and
// the section-stagger keyframes used as a CSS fallback. Per §15 only transform +
// opacity animate, hover is gated, and reduced-motion drops movement.

// The fixed overlay host: a full-viewport flex container that right-aligns the
// panel. It's a motion component so it can be the AnimatePresence direct child
// (framer-motion then defers unmount until the nested backdrop fade + panel slide
// exits finish). The backdrop sits behind; pointer-events are owned per-child so
// the backdrop catches outside clicks.
export const StyledDrawerOverlay = styled(motion.div)`
  display: flex;
  inset: 0;
  justify-content: flex-end;
  position: fixed;
  z-index: 1000;
`;

export const StyledDrawerBackdrop = styled.div`
  background: color-mix(in srgb, #000 44%, transparent);
  cursor: pointer;
  inset: 0;
  position: absolute;
`;

// The sliding panel. Width caps on small viewports. Internal scroll on the body
// only; header + footer pinned.
export const StyledDrawerPanel = styled.div`
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
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
  width: min(460px, 100vw);
  will-change: transform;

  /* The scrollable middle. Header + footer are outside this. */
  .propel-drawer-body {
    flex: 1;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 16px 20px 20px;
  }

  /* Section block: label + content, separated by a hairline. */
  .propel-drawer-section + .propel-drawer-section {
    border-top: 1px solid var(--mantine-color-default-border);
    margin-top: 18px;
    padding-top: 18px;
  }
  .propel-drawer-section-label {
    color: var(--mantine-color-dimmed);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.04em;
    margin-bottom: 10px;
    text-transform: uppercase;
  }

  /* Media gallery thumbs. */
  .propel-media-grid {
    display: grid;
    gap: 6px;
    grid-template-columns: repeat(3, 1fr);
  }
  .propel-media-tile {
    aspect-ratio: 1 / 1;
    background: color-mix(in srgb, var(--mantine-color-text) 6%, transparent);
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
  }
  .propel-media-tile img,
  .propel-media-tile video {
    display: block;
    height: 100%;
    object-fit: cover;
    width: 100%;
  }
  .propel-media-tile--opaque {
    align-items: center;
    color: var(--mantine-color-dimmed);
    display: flex;
    font-size: 10px;
    justify-content: center;
    padding: 6px;
    text-align: center;
    word-break: break-all;
  }

  /* Engagement metric cards. */
  .propel-metric-grid {
    display: grid;
    gap: 8px;
    grid-template-columns: repeat(4, 1fr);
  }
  .propel-metric-card {
    align-items: center;
    background: color-mix(in srgb, var(--mantine-color-text) 4%, transparent);
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 10px;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 10px 4px;
  }
  .propel-metric-value {
    color: var(--mantine-color-text);
    font-size: 16px;
    font-weight: 700;
    line-height: 1.1;
  }
  .propel-metric-label {
    color: var(--mantine-color-dimmed);
    font-size: 10px;
    letter-spacing: 0.03em;
    text-transform: uppercase;
  }

  /* Per-network result rows. */
  .propel-net-row {
    align-items: center;
    border: 1px solid var(--mantine-color-default-border);
    border-radius: 9px;
    display: flex;
    gap: 10px;
    padding: 8px 10px;
  }
  .propel-net-row + .propel-net-row {
    margin-top: 6px;
  }

  /* Lifecycle timeline. */
  .propel-timeline {
    display: flex;
    flex-direction: column;
    gap: 0;
  }
  .propel-timeline-node {
    display: flex;
    gap: 12px;
    padding-bottom: 14px;
    position: relative;
  }
  .propel-timeline-node:last-child {
    padding-bottom: 0;
  }
  /* The vertical connector line between dots. */
  .propel-timeline-rail {
    display: flex;
    flex: none;
    justify-content: center;
    position: relative;
    width: 16px;
  }
  .propel-timeline-node:not(:last-child) .propel-timeline-rail::after {
    background: var(--mantine-color-default-border);
    bottom: 0;
    content: '';
    position: absolute;
    top: 16px;
    width: 2px;
  }
  .propel-timeline-dot {
    background: var(--mantine-color-body);
    border: 2px solid var(--mantine-color-default-border);
    border-radius: 50%;
    flex: none;
    height: 14px;
    margin-top: 1px;
    position: relative;
    width: 14px;
    z-index: 1;
  }
  .propel-timeline-dot--done {
    background: var(--pulse-red);
    border-color: var(--pulse-red);
  }
  .propel-timeline-dot--current {
    background: color-mix(in srgb, var(--pulse-red) 30%, transparent);
    border-color: var(--pulse-red);
  }
  .propel-timeline-dot--failed {
    background: var(--failed-fill);
    border-color: var(--failed-fill);
  }
  /* PUBLISHING current node gets the breathing pulse (§15 — rare live state). */
  .propel-timeline-dot--pulse {
    animation: propel-detail-pulse 1.6s ease-in-out infinite;
  }
  .propel-timeline-label {
    color: var(--mantine-color-text);
    font-size: 12px;
    font-weight: 600;
  }
  .propel-timeline-node--pending .propel-timeline-label {
    color: var(--mantine-color-dimmed);
    font-weight: 500;
  }
  .propel-timeline-time {
    color: var(--mantine-color-dimmed);
    font-size: 11px;
    margin-top: 1px;
  }

  @keyframes propel-detail-pulse {
    0%,
    100% {
      opacity: 0.5;
      transform: scale(0.9);
    }
    50% {
      opacity: 1;
      transform: scale(1.05);
    }
  }

  /* Pressable affordance on footer buttons handled by Mantine; links get a
     hover underline only where hover is real. */
  @media (hover: hover) and (pointer: fine) {
    .propel-live-link:hover {
      text-decoration: underline;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .propel-timeline-dot--pulse {
      animation: none;
    }
  }
`;
