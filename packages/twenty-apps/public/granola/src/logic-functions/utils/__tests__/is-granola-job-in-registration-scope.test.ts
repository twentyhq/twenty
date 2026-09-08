import { describe, expect, it } from 'vitest';

import { isGranolaJobInRegistrationScope } from 'src/logic-functions/utils/is-granola-job-in-registration-scope.util';

const registration = {
  registrationId: 'reg-1',
  folderIds: [] as string[],
};

describe('isGranolaJobInRegistrationScope', () => {
  it('skips a job without a matching registration', () => {
    expect(
      isGranolaJobInRegistrationScope({
        registration: undefined,
        registrationId: 'reg-1',
        folderId: undefined,
      }),
    ).toBe(false);
    expect(
      isGranolaJobInRegistrationScope({
        registration,
        registrationId: 'reg-2',
        folderId: undefined,
      }),
    ).toBe(false);
  });

  it('accepts any folder while the registration syncs every folder', () => {
    expect(
      isGranolaJobInRegistrationScope({
        registration,
        registrationId: 'reg-1',
        folderId: 'fol_1',
      }),
    ).toBe(true);
  });

  it('requires the job folder to be one of the selected folders', () => {
    const restricted = { ...registration, folderIds: ['fol_1'] };

    expect(
      isGranolaJobInRegistrationScope({
        registration: restricted,
        registrationId: 'reg-1',
        folderId: 'fol_1',
      }),
    ).toBe(true);
    expect(
      isGranolaJobInRegistrationScope({
        registration: restricted,
        registrationId: 'reg-1',
        folderId: 'fol_2',
      }),
    ).toBe(false);
    expect(
      isGranolaJobInRegistrationScope({
        registration: restricted,
        registrationId: 'reg-1',
        folderId: undefined,
      }),
    ).toBe(false);
  });
});
