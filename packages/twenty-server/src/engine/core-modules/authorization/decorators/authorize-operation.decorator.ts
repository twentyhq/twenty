import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { OPERATION_POLICY_METADATA_KEY } from 'src/engine/core-modules/authorization/constants/operation-policy-metadata-key.constant';
import { OperationPolicyGuard } from 'src/engine/core-modules/authorization/guards/operation-policy.guard';
import { type OperationPolicy } from 'src/engine/core-modules/authorization/types/operation-policy.type';

export const AuthorizeOperation = (policy: OperationPolicy) =>
  applyDecorators(
    SetMetadata(OPERATION_POLICY_METADATA_KEY, policy),
    UseGuards(OperationPolicyGuard),
  );
