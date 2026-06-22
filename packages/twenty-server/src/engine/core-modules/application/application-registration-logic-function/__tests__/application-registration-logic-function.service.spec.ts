import { type Repository } from 'typeorm';

import { type ApplicationRegistrationLogicFunctionEntity } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.entity';
import { ApplicationRegistrationLogicFunctionService } from 'src/engine/core-modules/application/application-registration-logic-function/application-registration-logic-function.service';

describe('ApplicationRegistrationLogicFunctionService', () => {
  let service: ApplicationRegistrationLogicFunctionService;
  let repository: jest.Mocked<
    Pick<Repository<ApplicationRegistrationLogicFunctionEntity>, 'update'>
  >;

  beforeEach(() => {
    repository = { update: jest.fn().mockResolvedValue(undefined) };
    service = new ApplicationRegistrationLogicFunctionService(
      repository as unknown as Repository<ApplicationRegistrationLogicFunctionEntity>,
    );
  });

  it('disables by setting disabledAt', async () => {
    await service.setDisabled({ id: 'x', disabled: true });

    expect(repository.update).toHaveBeenCalledWith('x', {
      disabledAt: expect.any(Date),
    });
  });

  it('enables by clearing disabledAt', async () => {
    await service.setDisabled({ id: 'x', disabled: false });

    expect(repository.update).toHaveBeenCalledWith('x', { disabledAt: null });
  });
});
