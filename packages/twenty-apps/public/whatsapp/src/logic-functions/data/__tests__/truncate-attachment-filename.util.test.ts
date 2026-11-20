import { describe, expect, it } from 'vitest';
import { truncateAttachmentFilename } from 'src/logic-functions/data/truncate-attachment-filename.util';

describe('truncateAttachmentFilename', () => {
  it('should keep a short filename as is', () => {
    expect(truncateAttachmentFilename('invoice.pdf')).toBe('invoice.pdf');
  });

  it('should truncate a long filename to 255 characters and keep its extension', () => {
    const truncatedFilename = truncateAttachmentFilename(`${'a'.repeat(300)}.pdf`);

    expect(truncatedFilename).toHaveLength(255);
    expect(truncatedFilename.endsWith('.pdf')).toBe(true);
  });
});
