import { type OnModuleInit } from '@nestjs/common';

import { type OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { assertEveryMethodDeclaresAnOperation } from 'src/engine/core-modules/authorization/utils/assert-every-method-declares-an-operation.util';

// A service whose every method declares its @Operation, which the app checks when it boots.
// Helpers that are not operations belong in another service.
export abstract class OperationGuardedService implements OnModuleInit {
  constructor(
    readonly operationAuthorizationService: OperationAuthorizationService,
  ) {}

  onModuleInit(): void {
    assertEveryMethodDeclaresAnOperation({
      instance: this,
      baseClassPrototype: OperationGuardedService.prototype,
    });
  }
}
