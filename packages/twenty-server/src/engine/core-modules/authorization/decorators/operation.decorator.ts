import { SetMetadata } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OPERATION_METADATA_KEY } from 'src/engine/core-modules/authorization/constants/operation-metadata-key.constant';
import { type OperationGuardedService } from 'src/engine/core-modules/authorization/services/operation-guarded.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';
import { type OperationTarget } from 'src/engine/core-modules/authorization/types/operation-target.type';

type OperationTargetDeclaration<TInput> = Omit<OperationTarget, 'id'> & {
  // undefined when the call names no target, such as an optional input left out
  getId: (input: TInput) => string | undefined;
};

// Written as a method signature so its parameter is bivariant: a target reading only `id`
// then fits a method whose input carries more
type OperationMethod<TInput> = {
  method(input: TInput): Promise<unknown>;
}['method'];

// Declares the operation a service method performs. The method checks the policy, and its target
// when declared, before it runs, unless the flow already checked them on that target.
export const Operation =
  <TInput = unknown>(
    policy: OperationPolicy,
    options?: { target?: OperationTargetDeclaration<TInput> },
  ) =>
  <TMethod extends OperationMethod<TInput>>(
    prototype: OperationGuardedService,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<TMethod>,
  ): void => {
    const method = descriptor.value;

    if (!isDefined(method)) {
      throw new Error(`@Operation can only decorate a method (${propertyKey})`);
    }

    descriptor.value = async function (
      this: OperationGuardedService,
      input: TInput,
    ) {
      const targetDeclaration = options?.target;
      const targetId = targetDeclaration?.getId(input);

      await this.operationAuthorizationService.ensureAuthorized(
        policy,
        isDefined(targetDeclaration) && isDefined(targetId)
          ? {
              metadataName: targetDeclaration.metadataName,
              access: targetDeclaration.access,
              createOutOfReachException:
                targetDeclaration.createOutOfReachException,
              id: targetId,
            }
          : undefined,
      );

      return method.call(this, input);
    } as TMethod;

    SetMetadata(OPERATION_METADATA_KEY, policy)(
      prototype,
      propertyKey,
      descriptor,
    );
  };
