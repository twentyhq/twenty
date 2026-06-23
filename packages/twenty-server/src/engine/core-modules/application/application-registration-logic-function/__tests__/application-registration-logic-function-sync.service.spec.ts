import { type Manifest } from 'twenty-shared/application';
import { type Repository } from 'typeorm';

import { type ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationLogicFunctionSyncService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function-sync.service';

const APP_REGISTRATION_ID = '11111111-1111-1111-1111-111111111111';

const manifestWith = (
  logicFunctions: NonNullable<Manifest['logicFunctions']>,
): Manifest => ({ logicFunctions }) as Manifest;

describe('ApplicationRegistrationLogicFunctionSyncService', () => {
  let service: ApplicationRegistrationLogicFunctionSyncService;
  let repository: jest.Mocked<
    Pick<
      Repository<ApplicationRegistrationLogicFunctionEntity>,
      'find' | 'upsert' | 'softDelete'
    >
  >;

  beforeEach(() => {
    repository = {
      find: jest.fn().mockResolvedValue([]),
      upsert: jest.fn().mockResolvedValue(undefined),
      softDelete: jest.fn().mockResolvedValue(undefined),
    };
    service = new ApplicationRegistrationLogicFunctionSyncService(
      repository as unknown as Repository<ApplicationRegistrationLogicFunctionEntity>,
    );
  });

  it('upserts only logic functions that carry server-trigger settings', async () => {
    await service.syncFromManifest({
      applicationRegistrationId: APP_REGISTRATION_ID,
      manifest: manifestWith([
        {
          universalIdentifier: 'a',
          name: 'srv',
          serverWebhookTriggerSettings: {},
          sourceHandlerPath: '',
          builtHandlerPath: '',
          builtHandlerChecksum: '',
          handlerName: 'handler',
        },
        {
          universalIdentifier: 'b',
          name: 'workspace-only',
          sourceHandlerPath: '',
          builtHandlerPath: '',
          builtHandlerChecksum: '',
          handlerName: 'handler',
        },
      ]),
    });

    expect(repository.upsert).toHaveBeenCalledTimes(1);
    const [rows] = repository.upsert.mock.calls[0];

    expect(rows).toEqual([
      expect.objectContaining({
        universalIdentifier: 'a',
        applicationRegistrationId: APP_REGISTRATION_ID,
        serverWebhookTriggerSettings: {},
        // re-adding a previously soft-deleted row must clear `deletedAt`
        deletedAt: null,
      }),
    ]);
  });

  it('soft-deletes rows whose manifest entry disappeared', async () => {
    repository.find.mockResolvedValue([
      {
        id: 'row-1',
        universalIdentifier: 'gone',
      } as ApplicationRegistrationLogicFunctionEntity,
    ]);

    await service.syncFromManifest({
      applicationRegistrationId: APP_REGISTRATION_ID,
      manifest: manifestWith([]),
    });

    expect(repository.softDelete).toHaveBeenCalledWith(['row-1']);
  });
});
