import { renderToBuffer } from '@react-pdf/renderer';

import { buildDpaPdfDocumentElement } from 'src/engine/core-modules/dpa/pdf/dpa-pdf-document';
import { type ResolvedDpa } from 'src/engine/core-modules/dpa/types/dpa.types';

// Server-side PDF generation. @react-pdf/renderer renders with its own layout
// engine (Yoga) — no DOM/browser needed — so the executed copy we store is the
// exact copy the customer downloads.
export const renderDpaToPdfBuffer = (resolved: ResolvedDpa): Promise<Buffer> =>
  renderToBuffer(buildDpaPdfDocumentElement(resolved));
