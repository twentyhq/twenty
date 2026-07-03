import { describe, expect, it } from 'vitest';

import { generateDocumentPdf } from '../generate-document-pdf';

describe('generateDocumentPdf', () => {
  it('should produce a non-empty PDF document', () => {
    const bytes = generateDocumentPdf('Sales proposal', 'Dear Ada,\n\nHello.');

    expect(bytes.byteLength).toBeGreaterThan(0);
    // PDF files start with the "%PDF" magic bytes and end with the EOF marker.
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    expect(Buffer.from(bytes).toString('latin1')).toContain('%%EOF');
  });

  it('should handle long content that spans multiple pages', () => {
    const longContent = Array.from({ length: 400 }, (_, i) => `Line ${i}`).join('\n');

    const bytes = generateDocumentPdf('Big doc', longContent);

    expect(bytes.byteLength).toBeGreaterThan(0);
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    // Multiple pages → more than one /Type /Page object.
    const pdf = Buffer.from(bytes).toString('latin1');
    expect((pdf.match(/\/Type \/Page\b/g) ?? []).length).toBeGreaterThan(1);
  });
});
