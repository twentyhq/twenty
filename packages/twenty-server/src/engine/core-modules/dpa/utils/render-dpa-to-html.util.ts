import { escapeHtml } from 'src/engine/core-modules/emailing-domain/utils/escape-html.util';
import { type ResolvedDpa } from 'src/engine/core-modules/dpa/types/dpa.types';

const renderMultiline = (value: string): string =>
  escapeHtml(value)
    .split('\n')
    .filter((line) => line.trim() !== '')
    .map((line) => `<span class="dpa-line">${line}</span>`)
    .join('<br />');

// Pure HTML renderer for preview. Produces self-contained, sanitized markup
// (legal text is escaped) from the resolved document. The frontend renders the
// resolved blocks directly as React elements, so this is primarily used for
// tests and any server-side HTML needs.
export const renderDpaToHtml = (resolved: ResolvedDpa): string => {
  const parts: string[] = [];

  parts.push(`<h1 class="dpa-title">${escapeHtml(resolved.title)}</h1>`);
  parts.push(
    `<p class="dpa-last-updated">Last Updated: ${escapeHtml(
      resolved.lastUpdatedLabel,
    )}</p>`,
  );

  for (const block of resolved.blocks) {
    if (block.kind === 'heading') {
      parts.push(`<h2>${escapeHtml(block.text)}</h2>`);
    } else if (block.kind === 'signatureField') {
      parts.push(
        `<div class="dpa-signature-field"><strong>${escapeHtml(
          block.label ?? '',
        )}</strong><div>${renderMultiline(block.value ?? '')}</div></div>`,
      );
    } else {
      parts.push(`<p>${escapeHtml(block.text)}</p>`);
    }
  }

  return `<article class="dpa-document">${parts.join('\n')}</article>`;
};
