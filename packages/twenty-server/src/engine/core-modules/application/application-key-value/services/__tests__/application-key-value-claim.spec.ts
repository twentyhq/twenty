import { type Repository } from 'typeorm';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { type ApplicationRegistrationEntity } from 'src/engine/core-modules/application/application-registration/application-registration.entity';
import {
  type KeyValuePairEntity,
  KeyValuePairType,
} from 'src/engine/core-modules/key-value-pair/key-value-pair.entity';
import { type KeyValuePairService } from 'src/engine/core-modules/key-value-pair/key-value-pair.service';
import { ApplicationKeyValueService } from 'src/engine/core-modules/application/application-key-value/services/application-key-value.service';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

it.each([true, false])(
  'returns the atomic storage claim result: %s',
  async (claimed) => {
    const setIfNotExists = jest.fn().mockResolvedValue(claimed);
    const service = new ApplicationKeyValueService(
      { setIfNotExists } as unknown as KeyValuePairService,
      {} as Repository<KeyValuePairEntity>,
      {} as Repository<ApplicationEntity>,
      {} as Repository<ApplicationRegistrationEntity>,
    );
    expect(
      await service.setIfAbsent({
        application: { id: 'app-1' } as FlatApplication,
        workspaceId: 'workspace-1',
        key: 'summary-1',
        value: { status: 'RUNNING' },
      }),
    ).toBe(claimed);
    expect(setIfNotExists).toHaveBeenCalledWith({
      applicationId: 'app-1',
      workspaceId: 'workspace-1',
      key: 'summary-1',
      value: { status: 'RUNNING' },
      type: KeyValuePairType.APPLICATION_VARIABLE,
    });
  },
);
