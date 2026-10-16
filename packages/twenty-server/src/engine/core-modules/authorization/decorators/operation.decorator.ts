import { SetMetadata } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { OPERATION_METADATA_KEY } from 'src/engine/core-modules/authorization/constants/operation-metadata-key.constant';
import { type OperationGuardedService } from 'src/engine/core-modules/authorization/services/operation-guarded.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';

// Declares the operation a service method performs: its policy is checked before the method
// runs, unless the flow already checked it
export const Operation =
  (policy: OperationPolicy) =>
  <TArgs extends unknown[], TResult>(
    prototype: OperationGuardedService,
    propertyKey: string,
    descriptor: TypedPropertyDescriptor<(...args: TArgs) => Promise<TResult>>,
  ): void => {
    const method = descriptor.value;

    if (!isDefined(method)) {
      throw new Error(`@Operation can only decorate a method (${propertyKey})`);
    }

    descriptor.value = async function (
      this: OperationGuardedService,
      ...args: TArgs
    ) {
      await this.operationAuthorizationService.ensureAuthorized(policy);

      return method.apply(this, args);
    };

    SetMetadata(OPERATION_METADATA_KEY, policy)(
      prototype,
      propertyKey,
      descriptor,
    );
  };
