import { buildJobGroupLimiters } from 'src/engine/core-modules/logic-function/logic-function-trigger/utils/build-job-group-limiters.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatJobGroup } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group.type';
import { type FlatJobGroupMaps } from 'src/engine/metadata-modules/flat-job-group/types/flat-job-group-maps.type';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const API_LIMITER = { max: 50, durationMs: 60_000 };
const API_JOB_GROUP_UNIVERSAL_IDENTIFIER =
  '94f170ef-9343-4930-8b15-1e6efd354e1e';
const OTHER_APPLICATION_JOB_GROUP_UNIVERSAL_IDENTIFIER =
  '9db40a36-4e53-4312-8350-1572a82ea97b';

const buildFlatJobGroup = ({
  universalIdentifier,
  applicationId,
}: {
  universalIdentifier: string;
  applicationId: string;
}): FlatJobGroup => ({
  id: universalIdentifier,
  universalIdentifier,
  applicationId,
  applicationUniversalIdentifier: applicationId,
  workspaceId: 'workspace-1',
  name: 'api',
  limiter: API_LIMITER,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
});

const buildFlatJobGroupMaps = (): FlatJobGroupMaps => {
  const flatJobGroupMaps = createEmptyFlatEntityMaps();

  for (const flatJobGroup of [
    buildFlatJobGroup({
      universalIdentifier: API_JOB_GROUP_UNIVERSAL_IDENTIFIER,
      applicationId: 'application-1',
    }),
    buildFlatJobGroup({
      universalIdentifier: OTHER_APPLICATION_JOB_GROUP_UNIVERSAL_IDENTIFIER,
      applicationId: 'application-2',
    }),
  ]) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: flatJobGroup,
      flatEntityMapsToMutate: flatJobGroupMaps,
    });
  }

  return flatJobGroupMaps;
};

describe('buildJobGroupLimiters', () => {
  it('should map each job group of the application to a limiter keyed by its universal identifier', () => {
    expect(
      buildJobGroupLimiters({
        flatJobGroupMaps: buildFlatJobGroupMaps(),
        applicationId: 'application-1',
        jobGroupUniversalIdentifiers: [
          API_JOB_GROUP_UNIVERSAL_IDENTIFIER,
          API_JOB_GROUP_UNIVERSAL_IDENTIFIER,
        ],
      }),
    ).toEqual([
      {
        groupKey: `jobGroup:${API_JOB_GROUP_UNIVERSAL_IDENTIFIER}`,
        limiter: API_LIMITER,
      },
    ]);
  });

  it('should ignore unknown job groups and job groups of another application', () => {
    expect(
      buildJobGroupLimiters({
        flatJobGroupMaps: buildFlatJobGroupMaps(),
        applicationId: 'application-1',
        jobGroupUniversalIdentifiers: [
          OTHER_APPLICATION_JOB_GROUP_UNIVERSAL_IDENTIFIER,
          'b7e2c4a1-3d5f-4a6b-8c9d-0e1f2a3b4c5d',
        ],
      }),
    ).toEqual([]);
  });

  it('should not pace jobs before the job group column exists', () => {
    expect(
      buildJobGroupLimiters({
        flatJobGroupMaps: buildFlatJobGroupMaps(),
        applicationId: 'application-1',
        jobGroupUniversalIdentifiers: undefined,
      }),
    ).toEqual([]);
  });
});
