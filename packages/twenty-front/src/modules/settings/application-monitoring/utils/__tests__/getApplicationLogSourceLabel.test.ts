import { getApplicationLogSourceLabel } from '@/settings/application-monitoring/utils/getApplicationLogSourceLabel';

describe('getApplicationLogSourceLabel', () => {
  it('should return the label of a known source', () => {
    expect(getApplicationLogSourceLabel('UPGRADE')?.message).toBe('Upgrade');
  });

  it('should return undefined for an unknown source', () => {
    expect(getApplicationLogSourceLabel('SOMETHING_ELSE')).toBeUndefined();
  });
});
