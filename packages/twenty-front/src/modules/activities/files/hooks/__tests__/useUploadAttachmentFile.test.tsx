import { computePathWithoutToken } from '../useUploadAttachmentFile';

describe('computePathWithoutToken', () => {
  it('should remove token from path', () => {
    const input = 'https://example.com/image.jpg?token=abc123';
    const expected = 'https://example.com/image.jpg';
    expect(computePathWithoutToken(input)).toBe(expected);
  });

  it('should handle path without token', () => {
    const input = 'https://example.com/image.jpg?size=large';
    expect(computePathWithoutToken(input)).toBe(input);
  });
});
