import { getFieldSlug } from '@/object-metadata/utils/getFieldSlug';

describe('getFieldSlug', () => {
  it('should work as expected', () => {
    const res = getFieldSlug({ label: 'Pipeline Step' });
    expect(res).toBe('pipeline-step');
  });
});
