import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';

export type RoadmapPendingConnection = {
  recordId: string;
  port: 'start' | 'end';
  /** Cached anchor point in inner-canvas coordinates so the preview
      doesn't have to re-resolve barLayouts on every pointermove tick. */
  anchorXPx: number;
  anchorYPx: number;
};

// Set when the user clicks a connection-port dot to begin drawing a
// dependency edge. The Timeline renders an SVG preview from
// (anchorXPx, anchorYPx) to the live cursor position. Cleared when the
// user clicks a second port (commit), presses Escape, or clicks the
// empty canvas.
export const recordRoadmapPendingConnectionState =
  createAtomState<RoadmapPendingConnection | null>({
    key: 'recordRoadmapPendingConnectionState',
    defaultValue: null,
  });
