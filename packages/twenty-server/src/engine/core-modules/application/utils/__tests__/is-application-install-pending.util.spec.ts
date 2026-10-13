import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { isApplicationInstallPending } from 'src/engine/core-modules/application/utils/is-application-install-pending.util';

describe('isApplicationInstallPending', () => {
  const buildFlatApplicationMaps = (
    application: Pick<FlatApplication, 'version' | 'deletedAt'>,
  ) => ({
    byId: { 'application-id': application as FlatApplication },
    idByUniversalIdentifier: {},
  });

  it('should return true while the install has not completed', () => {
    expect(
      isApplicationInstallPending(
        buildFlatApplicationMaps({ version: null, deletedAt: null }),
        'application-id',
      ),
    ).toBe(true);
  });

  it('should return false once the install has completed', () => {
    expect(
      isApplicationInstallPending(
        buildFlatApplicationMaps({ version: '1.0.0', deletedAt: null }),
        'application-id',
      ),
    ).toBe(false);
  });

  it('should return false when the application is not in the cache', () => {
    expect(
      isApplicationInstallPending(
        { byId: {}, idByUniversalIdentifier: {} },
        'application-id',
      ),
    ).toBe(false);
  });

  it('should return false when the application is deleted', () => {
    expect(
      isApplicationInstallPending(
        buildFlatApplicationMaps({ version: null, deletedAt: new Date() }),
        'application-id',
      ),
    ).toBe(false);
  });
});
