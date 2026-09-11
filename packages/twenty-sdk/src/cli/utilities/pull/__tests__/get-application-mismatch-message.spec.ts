import { getApplicationMismatchMessage } from '@/cli/utilities/pull/get-application-mismatch-message';

const LOCAL_UID = 'b30a4560-fedb-4ccd-904a-3788762c7d33';
const OTHER_UID = '5b1e7c2a-3d4f-4e5a-9b6c-7d8e9f0a1b2c';

describe('getApplicationMismatchMessage', () => {
  it('should refuse a pull that would bring another application into the tree', () => {
    const message = getApplicationMismatchMessage({
      requestedUniversalIdentifier: OTHER_UID,
      localApplicationUniversalIdentifier: LOCAL_UID,
      hasLocalApplicationFile: true,
    });

    expect(message).toContain(LOCAL_UID);
    expect(message).toContain(OTHER_UID);
  });

  it('should refuse a pull when the declaration exists but could not be read', () => {
    const message = getApplicationMismatchMessage({
      requestedUniversalIdentifier: OTHER_UID,
      localApplicationUniversalIdentifier: null,
      hasLocalApplicationFile: true,
    });

    expect(message).toContain('could not be read');
    expect(message).toContain(OTHER_UID);
  });

  it('should allow a pull of the application the tree already defines', () => {
    expect(
      getApplicationMismatchMessage({
        requestedUniversalIdentifier: LOCAL_UID,
        localApplicationUniversalIdentifier: LOCAL_UID,
        hasLocalApplicationFile: true,
      }),
    ).toBeUndefined();
  });

  it('should allow a pull into a tree that defines no application yet', () => {
    expect(
      getApplicationMismatchMessage({
        requestedUniversalIdentifier: OTHER_UID,
        localApplicationUniversalIdentifier: null,
        hasLocalApplicationFile: false,
      }),
    ).toBeUndefined();
  });

  it('should allow a pull that names no application, so the tree decides', () => {
    expect(
      getApplicationMismatchMessage({
        requestedUniversalIdentifier: undefined,
        localApplicationUniversalIdentifier: LOCAL_UID,
        hasLocalApplicationFile: true,
      }),
    ).toBeUndefined();
  });
});
