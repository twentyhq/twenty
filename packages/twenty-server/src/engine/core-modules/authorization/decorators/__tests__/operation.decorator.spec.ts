import { PermissionFlagType } from 'twenty-shared/constants';

import { Operation } from 'src/engine/core-modules/authorization/decorators/operation.decorator';
import { type OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { OperationGuardedService } from 'src/engine/core-modules/authorization/services/operation-guarded.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';

const POLICY: OperationPolicy = {
  name: 'test.update',
  authPrincipal: {
    userSession: true,
    apiKey: true,
    oauthClient: true,
    application: true,
  },
  permissionFlags: [PermissionFlagType.WORKFLOWS],
};

class GuardedService extends OperationGuardedService {
  @Operation(POLICY)
  async update({ id }: { id: string; source: string }): Promise<string> {
    return `updated ${id}`;
  }

  @Operation(POLICY)
  async list(): Promise<string[]> {
    return [];
  }
}

class ServiceWithUndeclaredMethod extends GuardedService {
  async forgottenOperation(): Promise<void> {}
}

const buildOperationAuthorizationService = () =>
  ({
    ensureAuthorized: jest.fn().mockResolvedValue(undefined),
  }) as unknown as OperationAuthorizationService;

describe('@Operation', () => {
  it('should check the policy before the method runs', async () => {
    const operationAuthorizationService = buildOperationAuthorizationService();
    const service = new GuardedService(operationAuthorizationService);

    await expect(
      service.update({ id: 'function-id', source: 'code' }),
    ).resolves.toBe('updated function-id');
    expect(operationAuthorizationService.ensureAuthorized).toHaveBeenCalledWith(
      POLICY,
    );
  });

  it('should not run the method when the check refuses', async () => {
    const operationAuthorizationService = buildOperationAuthorizationService();

    jest
      .mocked(operationAuthorizationService.ensureAuthorized)
      .mockRejectedValue(new Error('refused'));

    await expect(
      new GuardedService(operationAuthorizationService).update({
        id: 'function-id',
        source: 'code',
      }),
    ).rejects.toThrow('refused');
  });

  it('should let a service boot when every method declares an operation', () => {
    expect(() =>
      new GuardedService(buildOperationAuthorizationService()).onModuleInit(),
    ).not.toThrow();
  });

  it('should refuse to boot a service with a method that declares no operation', () => {
    expect(() =>
      new ServiceWithUndeclaredMethod(
        buildOperationAuthorizationService(),
      ).onModuleInit(),
    ).toThrow(
      'ServiceWithUndeclaredMethod declares no @Operation on: forgottenOperation',
    );
  });
});
