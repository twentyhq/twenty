import { Test, type TestingModule } from '@nestjs/testing';

import { ApplicationPreferencesService } from 'src/engine/core-modules/application/application-preferences/application-preferences.service';
import { type UserApplicationVariableValueDTO } from 'src/engine/core-modules/application/application-variable/dtos/user-application-variable-value.dto';
import { UserApplicationVariableValueService } from 'src/engine/core-modules/application/application-variable/user-application-variable-value.service';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatSettingsMenuItemMaps } from 'src/engine/metadata-modules/flat-settings-menu-item/types/flat-settings-menu-item-maps.type';
import { type FlatSettingsMenuItem } from 'src/engine/metadata-modules/flat-settings-menu-item/types/flat-settings-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { addFlatEntityToFlatEntityMapsThroughMutationOrThrow } from 'src/engine/workspace-manager/workspace-migration/utils/add-flat-entity-to-flat-entity-maps-through-mutation-or-throw.util';

const WORKSPACE_ID = 'workspace-id';
const USER_WORKSPACE_ID = 'user-workspace-id';
const CREATED_AT = '2026-10-01T00:00:00.000Z';

const RECORDER_APPLICATION_ID = 'recorder-application-id';
const NOTETAKER_APPLICATION_ID = 'notetaker-application-id';
const CRM_SYNC_APPLICATION_ID = 'crm-sync-application-id';
const ANALYTICS_APPLICATION_ID = 'analytics-application-id';

const buildFlatApplication = (id: string, name: string) =>
  ({ id, name }) as FlatApplication;

const buildFlatSettingsMenuItem = ({
  universalIdentifier,
  applicationId,
  scope,
}: Pick<
  FlatSettingsMenuItem,
  'universalIdentifier' | 'applicationId' | 'scope'
>) =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    applicationId,
    scope,
    workspaceId: WORKSPACE_ID,
    frontComponentId: `${universalIdentifier}-front-component-id`,
    title: universalIdentifier,
    icon: null,
    position: 0,
    createdAt: CREATED_AT,
    updatedAt: CREATED_AT,
  }) as FlatSettingsMenuItem;

const buildVariable = (key: string, value: string) =>
  ({ key, value }) as UserApplicationVariableValueDTO;

const buildFlatSettingsMenuItemMaps = (
  flatSettingsMenuItems: FlatSettingsMenuItem[],
): FlatSettingsMenuItemMaps => {
  const flatSettingsMenuItemMaps: FlatSettingsMenuItemMaps =
    createEmptyFlatEntityMaps();

  for (const flatSettingsMenuItem of flatSettingsMenuItems) {
    addFlatEntityToFlatEntityMapsThroughMutationOrThrow({
      flatEntity: flatSettingsMenuItem,
      flatEntityMapsToMutate: flatSettingsMenuItemMaps,
    });
  }

  return flatSettingsMenuItemMaps;
};

describe('ApplicationPreferencesService', () => {
  let service: ApplicationPreferencesService;
  let findUserApplicationVariableValues: jest.Mock;

  beforeEach(async () => {
    findUserApplicationVariableValues = jest.fn(
      async ({ applicationId }: { applicationId: string }) => {
        switch (applicationId) {
          case RECORDER_APPLICATION_ID:
            return [
              {
                userWorkspaceId: USER_WORKSPACE_ID,
                workspaceMemberId: 'workspace-member-id',
                variables: [buildVariable('RECORD_MY_MEETINGS', 'true')],
              },
            ];
          case NOTETAKER_APPLICATION_ID:
            return [
              {
                userWorkspaceId: USER_WORKSPACE_ID,
                workspaceMemberId: 'workspace-member-id',
                variables: [buildVariable('LANGUAGE', 'en')],
              },
            ];
          default:
            return [];
        }
      },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicationPreferencesService,
        {
          provide: ApplicationService,
          useValue: {
            findManyInstalledFlatApplications: jest
              .fn()
              .mockResolvedValue([
                buildFlatApplication(RECORDER_APPLICATION_ID, 'Recorder'),
                buildFlatApplication(ANALYTICS_APPLICATION_ID, 'Analytics'),
                buildFlatApplication(CRM_SYNC_APPLICATION_ID, 'CRM sync'),
                buildFlatApplication(NOTETAKER_APPLICATION_ID, 'Notetaker'),
              ]),
          },
        },
        {
          provide: UserApplicationVariableValueService,
          useValue: { findUserApplicationVariableValues },
        },
        {
          provide: WorkspaceCacheService,
          useValue: {
            getOrRecompute: jest.fn().mockResolvedValue({
              flatSettingsMenuItemMaps: buildFlatSettingsMenuItemMaps([
                buildFlatSettingsMenuItem({
                  universalIdentifier: 'recorder-workspace-settings',
                  applicationId: RECORDER_APPLICATION_ID,
                  scope: 'WORKSPACE',
                }),
                buildFlatSettingsMenuItem({
                  universalIdentifier: 'crm-sync-user-settings',
                  applicationId: CRM_SYNC_APPLICATION_ID,
                  scope: 'USER',
                }),
                buildFlatSettingsMenuItem({
                  universalIdentifier: 'analytics-workspace-settings',
                  applicationId: ANALYTICS_APPLICATION_ID,
                  scope: 'WORKSPACE',
                }),
              ]),
            }),
          },
        },
      ],
    }).compile();

    service = module.get(ApplicationPreferencesService);
  });

  it('should list the applications with user settings or user variables, ordered by name', async () => {
    const applicationPreferences = await service.findMyApplicationPreferences({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });

    expect(applicationPreferences).toEqual([
      {
        applicationId: CRM_SYNC_APPLICATION_ID,
        settingsMenuItems: [
          expect.objectContaining({
            id: 'crm-sync-user-settings-id',
            universalIdentifier: 'crm-sync-user-settings',
            frontComponentId: 'crm-sync-user-settings-front-component-id',
            scope: 'USER',
            createdAt: new Date(CREATED_AT),
          }),
        ],
        variables: [],
      },
      {
        applicationId: NOTETAKER_APPLICATION_ID,
        settingsMenuItems: [],
        variables: [buildVariable('LANGUAGE', 'en')],
      },
      {
        applicationId: RECORDER_APPLICATION_ID,
        settingsMenuItems: [],
        variables: [buildVariable('RECORD_MY_MEETINGS', 'true')],
      },
    ]);
  });

  it('should only ask for the values of the requesting member', async () => {
    await service.findMyApplicationPreferences({
      workspaceId: WORKSPACE_ID,
      userWorkspaceId: USER_WORKSPACE_ID,
    });

    expect(findUserApplicationVariableValues).toHaveBeenCalledTimes(4);

    for (const [args] of findUserApplicationVariableValues.mock.calls) {
      expect(args).toMatchObject({
        workspaceId: WORKSPACE_ID,
        requestUserWorkspaceId: USER_WORKSPACE_ID,
      });
    }
  });
});
