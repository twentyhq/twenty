import {
  type CanActivate,
  type ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { isDefined } from 'twenty-shared/utils';

import { OPERATION_POLICY_METADATA_KEY } from 'src/engine/core-modules/authorization/constants/operation-policy-metadata-key.constant';
import { OperationAuthorizationService } from 'src/engine/core-modules/authorization/services/operation-authorization.service';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';

@Injectable()
export class OperationPolicyGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly operationAuthorizationService: OperationAuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const policy = this.reflector.get<OperationPolicy | undefined>(
      OPERATION_POLICY_METADATA_KEY,
      context.getHandler(),
    );

    if (!isDefined(policy)) {
      return true;
    }

    await this.operationAuthorizationService.authorizeOrThrow(policy);

    return true;
  }
}
