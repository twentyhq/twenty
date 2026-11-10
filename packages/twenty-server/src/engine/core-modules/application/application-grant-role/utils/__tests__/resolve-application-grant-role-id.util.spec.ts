import { Logger } from '@nestjs/common';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { resolveApplicationGrantRoleId } from 'src/engine/core-modules/application/application-grant-role/utils/resolve-application-grant-role-id.util';

const APPLICATION_ID = 'application-id';
const WORKSPACE_ID = 'workspace-id';
const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';

const resolve = ({
  applicationId = APPLICATION_ID,
  defaultRoleId = 'requested-role-id',
  sourceType = ApplicationRegistrationSourceType.NPM,
  grantRoleId,
}: {
  applicationId?: string;
  defaultRoleId?: string | null;
  sourceType?: ApplicationRegistrationSourceType;
  grantRoleId?: string;
}) =>
  resolveApplicationGrantRoleId({
    flatApplication: { id: applicationId, defaultRoleId, sourceType },
    workspaceId: WORKSPACE_ID,
    workspaceCustomApplicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
    flatRoleTargetByApplicationIdMaps:
      grantRoleId === undefined
        ? {}
        : { [applicationId]: { roleId: grantRoleId } },
  });

describe('resolveApplicationGrantRoleId', () => {
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.LOCAL,
  ])('resolves a %s application to its grant', (sourceType) => {
    expect(resolve({ sourceType, grantRoleId: 'grant-role-id' })).toBe(
      'grant-role-id',
    );
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resolves twenty-standard to its grant rather than Admin', () => {
    expect(
      resolve({
        applicationId: 'twenty-standard-application-id',
        defaultRoleId: 'admin-role-id',
        sourceType: ApplicationRegistrationSourceType.LOCAL,
        grantRoleId: 'admin-grant-role-id',
      }),
    ).toBe('admin-grant-role-id');
  });

  it('resolves the workspace custom application to its own role', () => {
    expect(
      resolve({
        applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
        defaultRoleId: 'custom-application-role-id',
      }),
    ).toBe('custom-application-role-id');
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resolves an OAuth-only application to no role', () => {
    expect(
      resolve({
        sourceType: ApplicationRegistrationSourceType.OAUTH_ONLY,
        grantRoleId: 'grant-role-id',
      }),
    ).toBeUndefined();
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('resolves an application without a requested role to no role, even with a leftover grant', () => {
    expect(
      resolve({ defaultRoleId: null, grantRoleId: 'grant-role-id' }),
    ).toBeUndefined();
  });

  it('falls back to the requested role and warns when the grant is missing', () => {
    expect(resolve({})).toBe('requested-role-id');
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy.mock.calls[0][0]).toContain(APPLICATION_ID);
    expect(warnSpy.mock.calls[0][0]).toContain(WORKSPACE_ID);
  });
});
