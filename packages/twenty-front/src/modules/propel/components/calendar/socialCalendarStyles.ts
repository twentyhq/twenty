import styled from '@emotion/styled';
import { PULSE_RED } from '@/propel/lib/socialCalendarConfig';

// react-big-calendar's base stylesheet (layout/positioning). Imported once here,
// at the calendar boundary — Twenty has no global rbc CSS. Propel overrides below
// are scoped to the styled wrapper so they never leak into the CRM.
import 'react-big-calendar/lib/css/react-big-calendar.css';
// The drag-and-drop addon's stylesheet (S4) — supplies the .rbc-addons-dnd-*
// classes the move interaction needs (drag preview, drop-target highlight).
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';

// The Pulse-themed calendar shell. All colors read Twenty's `--t-*` tokens (via
// PropelMantineProvider's bridge) so the grid matches the surrounding CRM in
// light + dark. Status pill treatments follow spec §7; motion follows §15
// (transform/opacity only, shared easing family).
export const StyledSocialCalendarShell = styled.div`
  --ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
  --ease-out: cubic-bezier(0.23, 1, 0.32, 1);
  --pulse-red: ${PULSE_RED};
  --pulse-red-soft: color-mix(in srgb, var(--pulse-red) 12%, transparent);

  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;

  .rbc-calendar {
    color: var(--mantine-color-text);
    flex: 1;
    font-family: inherit;
    min-height: 0;
  }

  /* Grid surfaces + borders use Twenty tokens. */
  .rbc-month-view,
  .rbc-time-view,
  .rbc-agenda-view {
    background: var(--mantine-color-body);
    border-color: var(--mantine-color-default-border);
    border-radius: 10px;
    overflow: hidden;
  }
  .rbc-header,
  .rbc-month-row + .rbc-month-row,
  .rbc-day-bg + .rbc-day-bg,
  .rbc-time-content,
  .rbc-time-header-content,
  .rbc-timeslot-group,
  .rbc-time-content > * + * > * {
    border-color: var(--mantine-color-default-border);
  }
  .rbc-header {
    color: var(--mantine-color-dimmed);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 8px 6px;
    text-transform: uppercase;
  }
  .rbc-date-cell {
    color: var(--mantine-color-text);
    font-size: 12px;
    padding: 4px 8px;
  }
  .rbc-off-range-bg {
    background: color-mix(in srgb, var(--mantine-color-text) 4%, transparent);
  }
  .rbc-off-range .rbc-button-link {
    color: var(--mantine-color-dimmed);
  }

  /* Today highlight — static (seen constantly, no pulse per §15). */
  .rbc-today {
    background: var(--pulse-red-soft);
  }
  .rbc-now .rbc-button-link {
    color: var(--pulse-red);
    font-weight: 700;
  }

  /* "+N more" link — Pulse red, no underline. */
  .rbc-show-more {
    background: transparent;
    color: var(--pulse-red);
    font-size: 11px;
    font-weight: 600;
  }

  /* Event pills — base. The library positions them; we restyle. Status-specific
     treatment (§7) keys off the rbc-event--<status> classes below. Only
     transform/opacity animate (GPU). */
  .rbc-event,
  .rbc-day-slot .rbc-event {
    background: transparent;
    border: 1px solid transparent;
    border-radius: 7px;
    box-shadow: none;
    outline: none;
    padding: 0;
    transition:
      transform 120ms var(--ease-out),
      box-shadow 120ms var(--ease-out);
  }
  .rbc-event:focus,
  .rbc-event.rbc-selected {
    outline: 2px solid var(--pulse-red);
    outline-offset: 1px;
  }
  @media (hover: hover) and (pointer: fine) {
    .rbc-event:hover {
      transform: translateY(-1px);
      z-index: 5;
    }
  }
  .rbc-event:active {
    transform: scale(0.98);
  }
  /* rbc sets inline bg on events; neutralize so our pill owns the look. */
  .rbc-event-content {
    overflow: visible;
  }

  /* ── S4 drag-to-reschedule (§7 / §15) ──
     Reschedulable (DRAFT/SCHEDULED) pills get a grab cursor; the pointer becomes
     grabbing mid-drag. Locked pills (POSTED/PUBLISHING/FAILED) show no-drop and
     never receive the addon's drag affordance. */
  .rbc-addons-dnd .rbc-event:not(.rbc-event--locked) {
    cursor: grab;
  }
  .rbc-addons-dnd.rbc-addons-dnd-is-dragging .rbc-event,
  .rbc-addons-dnd .rbc-event:not(.rbc-event--locked):active {
    cursor: grabbing;
  }
  .rbc-event--locked,
  .rbc-event--locked .rbc-event-content {
    cursor: no-drop;
  }
  /* Don't let a locked pill expose the addon's resize anchors. */
  .rbc-event--locked .rbc-addons-dnd-resize-ns-anchor,
  .rbc-event--locked .rbc-addons-dnd-resize-ew-anchor {
    display: none;
  }
  /* The dragged preview: lift it so it reads as "picked up" (transform/opacity
     only — GPU-cheap, §15). The spring settle on drop is handled by the optimistic
     state swap + framer toast, not here. The lift shadow is derived from the text
     token (a neutral scrim that adapts to light/dark), not a hardcoded color. */
  .rbc-addons-dnd .rbc-addons-dnd-drag-preview .rbc-event,
  .rbc-addons-dnd-dragged-event {
    opacity: 0.92;
    box-shadow: 0 6px 18px
      color-mix(in srgb, var(--mantine-color-text) 22%, transparent);
  }
  /* Drop target highlight while hovering a day cell with a dragged pill. */
  .rbc-addons-dnd .rbc-addons-dnd-over {
    background: var(--pulse-red-soft);
  }

  /* Agenda (List) view rows. */
  .rbc-agenda-view table.rbc-agenda-table {
    border-color: var(--mantine-color-default-border);
  }
  .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
    border-color: var(--mantine-color-default-border);
    color: var(--mantine-color-text);
    font-size: 12px;
    padding: 8px 10px;
  }
  .rbc-agenda-empty {
    color: var(--mantine-color-dimmed);
    padding: 24px;
  }

  /* PUBLISHING breathing pulse dot (§7/§15) — opacity-only, GPU-cheap. */
  @keyframes propel-pill-pulse {
    0%,
    100% {
      opacity: 0.45;
    }
    50% {
      opacity: 1;
    }
  }

  /* Reduced motion: drop transforms, keep nothing that moves. */
  @media (prefers-reduced-motion: reduce) {
    .rbc-event,
    .rbc-event:hover,
    .rbc-event:active {
      transition: none;
      transform: none;
    }
  }
`;

// Loading skeleton: a calendar-shaped grid with a shimmer sweep (clip-path,
// linear, 1.2s) — never a spinner (§5 / §15). Rows stagger via animation-delay.
export const StyledSocialCalendarSkeleton = styled.div`
  --skel-bg: color-mix(in srgb, var(--mantine-color-text) 7%, transparent);
  --skel-hi: color-mix(in srgb, var(--mantine-color-text) 12%, transparent);

  background: var(--mantine-color-body);
  border: 1px solid var(--mantine-color-default-border);
  border-radius: 10px;
  display: grid;
  gap: 6px;
  grid-template-columns: repeat(7, 1fr);
  height: 100%;
  min-height: 360px;
  padding: 8px;

  .skel-cell {
    background: var(--skel-bg);
    border-radius: 8px;
    min-height: 64px;
    overflow: hidden;
    position: relative;
  }
  .skel-cell::after {
    animation: propel-skel-sweep 1.2s linear infinite;
    background: linear-gradient(
      90deg,
      transparent 0%,
      var(--skel-hi) 50%,
      transparent 100%
    );
    content: '';
    inset: 0;
    position: absolute;
    transform: translateX(-100%);
  }
  @keyframes propel-skel-sweep {
    to {
      transform: translateX(100%);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .skel-cell::after {
      animation: none;
      opacity: 0.5;
      transform: none;
    }
  }
`;
