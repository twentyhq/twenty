import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ApplicationManifestExportService } from 'src/engine/core-modules/application/application-manifest/services/application-manifest-export.service';
import { ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import { ApplicationRegistrationService } from 'src/engine/core-modules/application/application-registration/application-registration.service';
import { ApplicationRegistrationSourceType } from 'src/engine/core-modules/application/application-registration/enums/application-registration-source-type.enum';
import { ApplicationTranslationCacheService } from 'src/engine/core-modules/application/application-translation/application-translation-cache.service';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { WORKSPACE_CUSTOM_APPLICATION_NAME } from 'src/engine/core-modules/application/constants/workspace-custom-application.constant';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyAllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-all-flat-entity-maps.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKSPACE_ID = 'workspace-id';
const OTHER_WORKSPACE_ID = 'other-workspace-id';
const APPLICATION_UNIVERSAL_IDENTIFIER = 'dcf080fd-3938-48f2-829d-b976483114d1';

describe('ApplicationManifestExportService ownership', () => {
  let service: ApplicationManifestExportService;
  let flatApplication: Pick<
    FlatApplication,
    | 'id'
    | 'universalIdentifier'
    | 'workspaceId'
    | 'name'
    | 'sourceType'
    | 'applicationRegistrationId'
    | 'deletedAt'
    | 'defaultRoleId'
    | 'packageJsonChecksum'
    | 'yarnLockChecksum'
    | 'grantedCapabilities'
  >;

  const applicationRegistrationRepository = { findOne: jest.fn() };
  const workspaceCacheService = { getOrRecompute: jest.fn() };
  const applicationTranslationCacheService = {
    getCatalogsByLocale: jest.fn(),
  };

  const exportApplication = () =>
    service.exportApplication({
      workspaceId: WORKSPACE_ID,
      applicationUniversalIdentifier: flatApplication.universalIdentifier,
    });

  const expectRegistrationLookedUpOnce = () => {
    expect(applicationRegistrationRepository.findOne).toHaveBeenCalledTimes(1);
    expect(applicationRegistrationRepository.findOne).toHaveBeenCalledWith({
      where: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    });
  };

  beforeEach(async () => {
    jest.resetAllMocks();

    flatApplication = {
      id: 'application-id',
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      workspaceId: WORKSPACE_ID,
      name: 'Local application',
      sourceType: ApplicationRegistrationSourceType.LOCAL,
      applicationRegistrationId: 'registration-id',
      deletedAt: null,
      defaultRoleId: null,
      packageJsonChecksum: null,
      yarnLockChecksum: null,
      grantedCapabilities: [],
    };

    workspaceCacheService.getOrRecompute.mockImplementation(async () => ({
      ...createEmptyAllFlatEntityMaps(),
      flatApplicationMaps: {
        byId: { [flatApplication.id]: flatApplication },
        idByUniversalIdentifier: {
          [flatApplication.universalIdentifier]: flatApplication.id,
        },
      },
    }));
    applicationRegistrationRepository.findOne.mockResolvedValue({
      id: flatApplication.applicationRegistrationId,
      universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
      ownerWorkspaceId: WORKSPACE_ID,
    });
    applicationTranslationCacheService.getCatalogsByLocale.mockResolvedValue({
      en: { greeting: 'Hello' },
    });

    const module = await Test.createTestingModule({
      providers: [
        ApplicationManifestExportService,
        ApplicationRegistrationService,
        {
          provide: getRepositoryToken(ApplicationRegistrationEntity),
          useValue: applicationRegistrationRepository,
        },
        { provide: WorkspaceCacheService, useValue: workspaceCacheService },
        {
          provide: ApplicationTranslationCacheService,
          useValue: applicationTranslationCacheService,
        },
      ],
    })
      .useMocker(() => ({}))
      .compile();

    service = module.get(ApplicationManifestExportService);
  });

  it.each(['Local application', WORKSPACE_CUSTOM_APPLICATION_NAME])(
    'exports the owning workspace application: %s',
    async (name) => {
      flatApplication.name = name;

      await expect(exportApplication()).resolves.toMatchObject({
        application: {
          universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER,
          displayName: name,
        },
        manifest: { translations: { en: { greeting: 'Hello' } } },
      });
      expectRegistrationLookedUpOnce();
    },
  );

  it.each([
    { title: 'another workspace', ownerWorkspaceId: OTHER_WORKSPACE_ID },
    { title: 'no workspace', ownerWorkspaceId: null },
  ])('rejects an application owned by $title', async ({ ownerWorkspaceId }) => {
    applicationRegistrationRepository.findOne.mockResolvedValue({
      ownerWorkspaceId,
    });

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expectRegistrationLookedUpOnce();
    expect(
      applicationTranslationCacheService.getCatalogsByLocale,
    ).not.toHaveBeenCalled();
  });

  it('rejects an application with no registration', async () => {
    applicationRegistrationRepository.findOne.mockResolvedValue(null);

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
    });
    expectRegistrationLookedUpOnce();
    expect(
      applicationTranslationCacheService.getCatalogsByLocale,
    ).not.toHaveBeenCalled();
  });

  it('rejects a foreign registration even without an application registration link', async () => {
    flatApplication.applicationRegistrationId = null;
    applicationRegistrationRepository.findOne.mockResolvedValue({
      ownerWorkspaceId: OTHER_WORKSPACE_ID,
    });

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expectRegistrationLookedUpOnce();
  });

  it('rechecks ownership when the local installation remains cached after a transfer', async () => {
    await expect(exportApplication()).resolves.toMatchObject({
      application: { universalIdentifier: APPLICATION_UNIVERSAL_IDENTIFIER },
    });
    expectRegistrationLookedUpOnce();

    applicationRegistrationRepository.findOne.mockClear();
    applicationRegistrationRepository.findOne.mockResolvedValue({
      ownerWorkspaceId: OTHER_WORKSPACE_ID,
    });
    applicationTranslationCacheService.getCatalogsByLocale.mockClear();

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.FORBIDDEN,
    });
    expectRegistrationLookedUpOnce();
    expect(
      applicationTranslationCacheService.getCatalogsByLocale,
    ).not.toHaveBeenCalled();
  });

  it('keeps the not-installed error without looking up a registration', async () => {
    workspaceCacheService.getOrRecompute.mockResolvedValue({
      ...createEmptyAllFlatEntityMaps(),
      flatApplicationMaps: { byId: {}, idByUniversalIdentifier: {} },
    });

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.APPLICATION_NOT_FOUND,
    });
    expect(applicationRegistrationRepository.findOne).not.toHaveBeenCalled();
  });

  it('keeps the standard application rejection', async () => {
    flatApplication.universalIdentifier =
      TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER;

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.STANDARD_APPLICATION_NOT_EXPORTABLE,
    });
    expect(applicationRegistrationRepository.findOne).not.toHaveBeenCalled();
  });

  it.each([
    ApplicationRegistrationSourceType.NPM,
    ApplicationRegistrationSourceType.TARBALL,
    ApplicationRegistrationSourceType.OAUTH_ONLY,
  ])('keeps the %s application rejection', async (sourceType) => {
    flatApplication.sourceType = sourceType;

    await expect(exportApplication()).rejects.toMatchObject({
      code: ApplicationExceptionCode.APPLICATION_NOT_EXPORTABLE,
    });
    expect(applicationRegistrationRepository.findOne).not.toHaveBeenCalled();
  });
});
