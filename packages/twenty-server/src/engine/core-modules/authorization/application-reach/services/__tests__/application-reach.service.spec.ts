import { type Repository } from 'typeorm';

import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  startWorkspaceAuthContext,
  withSystemAuthorizationScope,
  withWorkspaceAuthContext,
} from 'src/engine/core-modules/auth/storage/workspace-auth-context.storage';
import { type WorkspaceAuthContext } from 'src/engine/core-modules/auth/types/workspace-auth-context.type';
import { ApplicationReachRefusedException } from 'src/engine/core-modules/authorization/application-reach/exceptions/application-reach-refused.exception';
import { ApplicationReachService } from 'src/engine/core-modules/authorization/application-reach/services/application-reach.service';
import { type WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { type WorkspaceManyOrAllFlatEntityMapsCacheService } from 'src/engine/metadata-modules/flat-entity/services/workspace-many-or-all-flat-entity-maps-cache.service';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type SyncableFlatEntity } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-from.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const INSTALLED_APPLICATION_ID = 'installed-application-id';
const OTHER_APPLICATION_ID = 'other-application-id';

const buildFlatEntity = (id: string, applicationId: string) =>
  ({
    id,
    universalIdentifier: `${id}-uid`,
    applicationId,
  }) as SyncableFlatEntity;

const ownEntity = buildFlatEntity('own', INSTALLED_APPLICATION_ID);
const otherEntity = buildFlatEntity('other', OTHER_APPLICATION_ID);

const flatEntityMaps: FlatEntityMaps<SyncableFlatEntity> = {
  byUniversalIdentifier: {
    [ownEntity.universalIdentifier]: ownEntity,
    [otherEntity.universalIdentifier]: otherEntity,
  },
  universalIdentifierById: {
    [ownEntity.id]: ownEntity.universalIdentifier,
    [otherEntity.id]: otherEntity.universalIdentifier,
  },
  universalIdentifiersByApplicationId: {
    [INSTALLED_APPLICATION_ID]: [ownEntity.universalIdentifier],
    [OTHER_APPLICATION_ID]: [otherEntity.universalIdentifier],
  },
};

const installedApplicationAuthContext = {
  type: 'application',
  workspace: {
    id: WORKSPACE_ID,
    workspaceCustomApplicationId: 'workspace-custom-application-id',
  },
  application: {
    id: INSTALLED_APPLICATION_ID,
    sourceType: ApplicationRegistrationSourceType.TARBALL,
  } as FlatApplication,
} as WorkspaceAuthContext;

const asInstalledApplication = <TResult>(callback: () => Promise<TResult>) =>
  startWorkspaceAuthContext(
    {
      authContext: installedApplicationAuthContext,
      principal: {
        kind: 'application',
        variant: 'withoutUser',
        withAgent: false,
      },
    },
    callback,
  );

const buildService = () => {
  const service = new ApplicationReachService(
    {
      getOrRecomputeManyOrAllFlatEntityMaps: jest
        .fn()
        .mockImplementation(async ({ flatMapsKeys }) =>
          Object.fromEntries(
            flatMapsKeys.map((key: string) => [key, flatEntityMaps]),
          ),
        ),
    } as unknown as WorkspaceManyOrAllFlatEntityMapsCacheService,
    {
      getOrRecompute: jest.fn().mockResolvedValue({
        flatApplicationMaps: { idByUniversalIdentifier: {}, byId: {} },
      }),
    } as unknown as WorkspaceCacheService,
    {} as Repository<WorkspaceEntity>,
  );

  const warn = jest
    .spyOn(
      (service as unknown as { logger: { warn: () => void } }).logger,
      'warn',
    )
    .mockImplementation(() => undefined);

  return { service, warn };
};

describe('ApplicationReachService', () => {
  describe('on an enforced metadata name', () => {
    it("should answer NOT_FOUND for another application's entity", async () => {
      const { service } = buildService();

      const reachableMaps = await asInstalledApplication(() =>
        service.getReachableFlatEntityMaps({
          workspaceId: WORKSPACE_ID,
          metadataName: 'logicFunction',
          access: 'trigger',
        }),
      );

      expect(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: ownEntity.id,
          flatEntityMaps: reachableMaps,
        }),
      ).toBe(ownEntity);
      expect(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: otherEntity.id,
          flatEntityMaps: reachableMaps,
        }),
      ).toBeUndefined();
    });

    it('should refuse a read when nothing vouched for the caller', async () => {
      const { service } = buildService();

      await expect(
        withWorkspaceAuthContext(installedApplicationAuthContext, () =>
          service.getReachableFlatEntityMaps({
            workspaceId: WORKSPACE_ID,
            metadataName: 'logicFunction',
            access: 'read',
          }),
        ),
      ).rejects.toBeInstanceOf(ApplicationReachRefusedException);
    });

    it('should give the whole workspace to the system scope', async () => {
      const { service } = buildService();

      const reachableMaps = await withSystemAuthorizationScope(
        { workspaceId: WORKSPACE_ID, reason: 'test' },
        () =>
          service.getReachableFlatEntityMaps({
            workspaceId: WORKSPACE_ID,
            metadataName: 'logicFunction',
            access: 'manage',
          }),
      );

      expect(Object.keys(reachableMaps.byUniversalIdentifier)).toHaveLength(2);
    });

    it("should refuse to manage another application's entity", async () => {
      const { service } = buildService();

      await expect(
        asInstalledApplication(() =>
          service.assertCanManageFlatEntitiesOrThrow({
            workspaceId: WORKSPACE_ID,
            metadataName: 'logicFunction',
            flatEntities: [{ applicationId: OTHER_APPLICATION_ID }],
          }),
        ),
      ).rejects.toBeInstanceOf(ApplicationReachRefusedException);
    });

    it('should refuse to create an entity owned by another application', async () => {
      const { service } = buildService();

      await expect(
        asInstalledApplication(() =>
          service.assertCanCreateOrThrow({
            workspaceId: WORKSPACE_ID,
            metadataName: 'logicFunction',
            ownerApplicationId: OTHER_APPLICATION_ID,
          }),
        ),
      ).rejects.toBeInstanceOf(ApplicationReachRefusedException);
    });
  });

  describe('on a report-only metadata name', () => {
    it('should return every entity and warn on reading one out of reach', async () => {
      const { service, warn } = buildService();

      const reachableMaps = await asInstalledApplication(() =>
        service.getReachableFlatEntityMaps({
          workspaceId: WORKSPACE_ID,
          metadataName: 'agent',
          access: 'read',
        }),
      );

      expect(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: ownEntity.id,
          flatEntityMaps: reachableMaps,
        }),
      ).toBe(ownEntity);
      expect(warn).not.toHaveBeenCalled();

      expect(
        findFlatEntityByIdInFlatEntityMaps({
          flatEntityId: otherEntity.id,
          flatEntityMaps: reachableMaps,
        }),
      ).toBe(otherEntity);
      expect(warn).toHaveBeenCalledTimes(1);
    });

    it('should let a write out of reach through with a warning', async () => {
      const { service, warn } = buildService();

      await asInstalledApplication(() =>
        service.assertCanManageFlatEntitiesOrThrow({
          workspaceId: WORKSPACE_ID,
          metadataName: 'agent',
          flatEntities: [{ applicationId: OTHER_APPLICATION_ID }],
        }),
      );

      expect(warn).toHaveBeenCalledTimes(1);
    });
  });
});
