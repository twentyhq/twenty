import { getAdminApplicationLogLevels } from '@/settings/admin-panel/apps/utils/getAdminApplicationLogLevels';

describe('getAdminApplicationLogLevels', () => {
  it('should not filter levels for all levels', () => {
    expect(getAdminApplicationLogLevels('all')).toBeUndefined();
  });

  it('should keep errors and warnings', () => {
    expect(getAdminApplicationLogLevels('errorsAndWarnings')).toEqual([
      'ERROR',
      'WARN',
    ]);
  });
});
