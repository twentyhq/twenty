import { renderToBuffer } from '@react-pdf/renderer';

import { buildDpaPdfDocumentElement } from 'src/engine/core-modules/dpa/pdf/dpa-pdf-document';
import { type ResolvedDpa } from 'src/engine/core-modules/dpa/types/dpa.types';

// @react-pdf/renderer renders server-side via its own layout engine (no DOM/browser needed).
export const renderDpaToPdfBuffer = (resolved: ResolvedDpa): Promise<Buffer> =>
  renderToBuffer(buildDpaPdfDocumentElement(resolved));
