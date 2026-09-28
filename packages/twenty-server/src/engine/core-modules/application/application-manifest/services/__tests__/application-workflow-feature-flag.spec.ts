import { Test } from '@nestjs/testing';

import { ComputeApplicationManifestAllUniversalFlatEntityMapsService } from 'src/engine/core-modules/application/application-manifest/services/compute-application-manifest-all-universal-flat-entity-maps.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';

const MANIFEST = buildBaseManifest({
  appId: 'app',
  roleId: 'role',
  overrides: {
    workflows: [
      {
        universalIdentifier: 'workflow',
        name: 'Workflow',
        version: {
          universalIdentifier: 'version',
          trigger: {
            universalIdentifier: 'trigger',
            type: 'MANUAL',
            nextStepIds: ['step'],
          },
          steps: [
            {
              universalIdentifier: 'step',
              type: 'EMPTY',
              name: 'Finish',
              input: {},
              nextStepIds: [],
            },
          ],
        },
      },
    ],
  },
});

describe('application workflow installation gate', () => {
  it.each([undefined, false])(
    'rejects workflows when the flag is %s before converting any metadata',
    async (isApplicationWorkflowsEnabled) => {
      const module = await Test.createTestingModule({
        providers: [
          ComputeApplicationManifestAllUniversalFlatEntityMapsService,
        ],
      })
        .useMocker(() => ({}))
        .compile();
      const service = module.get(
        ComputeApplicationManifestAllUniversalFlatEntityMapsService,
      );
      expect(() =>
        service.compute({
          manifest: MANIFEST,
          ownerFlatApplication: {} as FlatApplication,
          fromAllFlatEntityMaps: createEmptyAllFlatEntityMaps(),
          isLogicFunctionPrebuiltModeEnabled: false,
          isApplicationWorkflowsEnabled,
          now: '2026-09-28T00:00:00.000Z',
          workspaceId: 'workspace',
        }),
      ).toThrow('Application workflows are not enabled');
    },
  );
});
