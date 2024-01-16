import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';

describe('validateMetadataLabel', () => {
  it('should work as expected', () => {
    const res = validateMetadataLabel('Pipeline Step');
    expect(res).toBe(true);
  });
});
