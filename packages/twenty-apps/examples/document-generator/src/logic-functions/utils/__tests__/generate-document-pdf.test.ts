import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';

import { generateDocumentPdf } from '../generate-document-pdf';

const MARKDOWN = `## Introduction

Dear **Jeffery Griffin**, here is our _proposal_.

- First point
- Second point

> A closing note.`;

describe('generateDocumentPdf', () => {
  it('should produce a valid PDF from markdown', async () => {
    const bytes = await generateDocumentPdf(MARKDOWN);

    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    expect(Buffer.from(bytes).toString('latin1')).toContain('%%EOF');
  });

  it('should paginate long content across multiple pages', async () => {
    const long = Array.from(
      { length: 120 },
      (_, i) => `Paragraph number ${i} with some text.`,
    ).join('\n\n');

    const bytes = await generateDocumentPdf(long);
    const loaded = await PDFDocument.load(bytes);

    expect(loaded.getPageCount()).toBeGreaterThan(1);
  });

  it('should keep a delivery note with many rows compact', async () => {
    const rows = Array.from(
      { length: 80 },
      (_, index) =>
        `| REF-${String(index + 1).padStart(3, '0')} | Article de livraison ${index + 1} | ${index + 1} | 12,50 EUR |`,
    ).join('\n');
    const deliveryNote = `# Bon de livraison BL-ACH-000005-01

| Référence | Désignation | Quantité | Prix unitaire |
| --- | --- | ---: | ---: |
${rows}`;

    const bytes = await generateDocumentPdf(deliveryNote);
    const loaded = await PDFDocument.load(bytes);

    expect(loaded.getPageCount()).toBeLessThanOrEqual(3);
  });

  it('should render explicit line breaks and non-Latin characters without throwing', async () => {
    // The body fonts use WinAnsi encoding: a naive sanitizer would either
    // throw on unencodable characters or swallow the `\n` line breaks.
    const content =
      'Bonjour **José**,\nRendez-vous à 20€ le 5 — merci.\n\n世界 dropped gracefully.';

    const bytes = await generateDocumentPdf(content);

    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
  });
});
