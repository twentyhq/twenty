import { type PageLayoutTabManifest } from 'twenty-shared/application';
import { PageLayoutTabLayoutMode } from 'twenty-shared/types';

import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';

describe('application manifest page layouts', () => {
  const service =
    new ComputeApplicationManifestAllUniversalFlatEntityMapsService(
      {} as SecretEncryptionService,
    );
  const tab: PageLayoutTabManifest = {
    universalIdentifier: 'tab',
    title: 'App',
    position: 0,
    layoutMode: PageLayoutTabLayoutMode.CANVAS,
    widgets: [
      {
        universalIdentifier: 'widget',
        title: 'App',
        type: 'FRONT_COMPONENT',
        configuration: {
          configurationType: 'FRONT_COMPONENT',
          frontComponentUniversalIdentifier: 'component',
        },
      },
    ],
  };
  const compute = (pageLayoutTab: PageLayoutTabManifest, location: string) =>
    service.compute({
      manifest: {
        application: {
          universalIdentifier: 'app',
          displayName: 'App',
          description: 'App',
          defaultRoleUniversalIdentifier: 'role',
          packageJsonChecksum: 'package-checksum',
          yarnLockChecksum: 'lockfile-checksum',
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
        publicAssets: [],
        views: [],
        viewFields: [],
        navigationMenuItems: [],
        commandMenuItems: [],
        timelineActivityTypes: [],
        pageLayouts: [
          {
            universalIdentifier: 'page',
            name: 'App',
            type: 'STANDALONE_PAGE',
            tabs: location === 'nested' ? [pageLayoutTab] : [],
          },
        ],
        pageLayoutTabs:
          location === 'standalone'
            ? [{ ...pageLayoutTab, pageLayoutUniversalIdentifier: 'page' }]
            : [],
      },
      ownerFlatApplication: { universalIdentifier: 'app' } as FlatApplication,
      fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
      isLogicFunctionPrebuiltModeEnabled: false,
      now: '2026-09-05T00:00:00.000Z',
      workspaceId: 'workspace',
    });

  it.each(['nested', 'standalone'])(
    'normalizes a legacy %s tab and its widget together',
    (location) => {
      const result = compute(tab, location);

      expect(
        result.flatPageLayoutTabMaps.byUniversalIdentifier.tab,
      ).toMatchObject({ layoutMode: 'VERTICAL_LIST' });
      expect(
        result.flatPageLayoutWidgetMaps.byUniversalIdentifier.widget,
      ).toMatchObject({
        pageLayoutTabUniversalIdentifier: 'tab',
        position: {
          layoutMode: 'VERTICAL_LIST',
          index: 0,
          heightBehavior: 'TAB_VIEWPORT',
        },
      });
    },
  );

  it.each(['nested', 'standalone'])(
    'rejects invalid values in a %s JSON manifest',
    (location) => {
      const invalidTab: PageLayoutTabManifest = JSON.parse(
        JSON.stringify({
          ...tab,
          layoutMode: 'VERTICAL_LIST',
          widgets: tab.widgets?.map((widget) => ({
            ...widget,
            heightBehavior: 'TAB_VIEPORT',
          })),
        }),
      );

      expect(() => compute(invalidTab, location)).toThrow(ApplicationException);
      expect(() => compute(invalidTab, location)).toThrow(
        'unsupported heightBehavior "TAB_VIEPORT"',
      );
    },
  );

  it('rejects top-level heightBehavior on authored Canvas before normalization', () => {
    const invalidTab: PageLayoutTabManifest = {
      ...tab,
      widgets: tab.widgets?.map((widget) => ({
        ...widget,
        heightBehavior: 'TAB_VIEWPORT',
      })),
    };
    expect(() => compute(invalidTab, 'nested')).toThrow(
      'heightBehavior is only supported for VERTICAL_LIST tabs',
    );
  });
});
