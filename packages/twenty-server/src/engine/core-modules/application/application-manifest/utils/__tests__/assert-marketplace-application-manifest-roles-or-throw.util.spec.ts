import { type Manifest } from 'twenty-shared/application';

import { assertMarketplaceApplicationManifestRolesOrThrow } from 'src/engine/core-modules/application/application-manifest/utils/assert-marketplace-application-manifest-roles-or-throw.util';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';

const buildManifest = (
  roles: Manifest['roles'],
): Pick<Manifest, 'application' | 'roles' | 'agents'> =>
  ({
    application: {
      universalIdentifier: 'application',
      displayName: 'Application',
      defaultRoleUniversalIdentifier: 'requested-role',
    },
    roles,
    agents: [],
  }) as unknown as Pick<Manifest, 'application' | 'roles' | 'agents'>;

describe('assertMarketplaceApplicationManifestRolesOrThrow', () => {
  it('should not throw on a standalone role', () => {
    expect(() =>
      assertMarketplaceApplicationManifestRolesOrThrow({
        manifest: buildManifest([
          { universalIdentifier: 'requested-role', label: 'Requested' },
          {
            universalIdentifier: 'member-role',
            label: 'Member',
            fieldPermissions: [
              {
                objectUniversalIdentifier: 'company',
                fieldUniversalIdentifier: 'secret',
                canReadFieldValue: false,
              },
            ],
          },
        ]),
      }),
    ).not.toThrow();
  });

  it('should throw naming the app, the role and what it declares', () => {
    expect(() =>
      assertMarketplaceApplicationManifestRolesOrThrow({
        manifest: buildManifest([
          {
            universalIdentifier: 'requested-role',
            label: 'Requested',
            recordsPermissions: {
              objects: [
                {
                  objectUniversalIdentifier: 'company',
                  unreadableFields: ['secret'],
                },
              ],
            },
          },
        ]),
      }),
    ).toThrow(
      new ApplicationException(
        'Application "Application" (application) declares role permissions marketplace applications cannot declare: Role "Requested" (requested-role), the application role, declares field permissions on objects company. Marketplace applications cannot declare field permissions: the workspace configures them.',
        'INVALID_INPUT' as never,
      ),
    );
  });
});
