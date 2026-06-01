import { type Manifest } from 'twenty-shared/application';

import { getFieldsWidgetSyncMonitoringSummary } from 'src/engine/core-modules/application/application-manifest/utils/get-fields-widget-sync-monitoring-summary.util';

const buildManifest = (
  configuration: Record<string, unknown>,
): Manifest =>
  ({
    application: {
      universalIdentifier: 'app-uuid-1',
      displayName: 'App',
      author: 'Twenty',
      defaultRoleUniversalIdentifier: 'role-uuid-1',
      description: 'desc',
      logoUrl: 'https://example.com/logo.png',
      packageJsonChecksum: 'checksum',
      yarnLockChecksum: 'checksum',
    },
    objects: [],
    fields: [],
    indexes: [],
    logicFunctions: [],
    frontComponents: [],
    permissionFlags: [],
    roles: [],
    skills: [],
    agents: [],
    connectionProviders: [],
    publicAssets: [],
    views: [],
    navigationMenuItems: [],
    pageLayouts: [
      {
        universalIdentifier: 'layout-uuid-1',
        name: 'layout',
        tabs: [
          {
            universalIdentifier: 'tab-uuid-1',
            title: 'tab',
            position: 0,
            widgets: [
              {
                universalIdentifier: 'widget-uuid-1',
                title: 'Fields',
                type: 'FIELDS',
                configuration: {
                  configurationType: 'FIELDS',
                  ...configuration,
                },
              },
            ],
          },
        ],
      },
    ],
    pageLayoutTabs: [],
    commandMenuItems: [],
  }) as Manifest;

describe('getFieldsWidgetSyncMonitoringSummary', () => {
  it('should count fields widgets with legacy viewId key', () => {
    const result = getFieldsWidgetSyncMonitoringSummary({
      manifest: buildManifest({ viewId: 'view-uuid-1' }),
    });

    expect(result).toEqual({
      fieldsWidgetWithLegacyViewIdCount: 1,
      fieldsWidgetWithoutViewReferenceCount: 0,
    });
  });

  it('should count fields widgets without any view reference key', () => {
    const result = getFieldsWidgetSyncMonitoringSummary({
      manifest: buildManifest({ shouldAllowUserToSeeHiddenFields: true }),
    });

    expect(result).toEqual({
      fieldsWidgetWithLegacyViewIdCount: 0,
      fieldsWidgetWithoutViewReferenceCount: 1,
    });
  });

  it('should ignore fields widgets using viewUniversalIdentifier', () => {
    const result = getFieldsWidgetSyncMonitoringSummary({
      manifest: buildManifest({ viewUniversalIdentifier: 'view-uuid-1' }),
    });

    expect(result).toEqual({
      fieldsWidgetWithLegacyViewIdCount: 0,
      fieldsWidgetWithoutViewReferenceCount: 0,
    });
  });
});
