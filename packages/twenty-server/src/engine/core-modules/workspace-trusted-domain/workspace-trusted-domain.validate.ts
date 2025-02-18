import { isDefined } from 'twenty-shared';

import { CustomException } from 'src/utils/custom-exception';
import { WorkspaceTrustedDomain } from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.entity';
import {
  WorkspaceTrustedDomainException,
  WorkspaceTrustedDomainExceptionCode,
} from 'src/engine/core-modules/workspace-trusted-domain/workspace-trusted-domain.exception';

const assertIsDefinedOrThrow = (
  trustedDomain: WorkspaceTrustedDomain | undefined | null,
  exceptionToThrow: CustomException = new WorkspaceTrustedDomainException(
    'Trusted domain not found',
    WorkspaceTrustedDomainExceptionCode.WORKSPACE_TRUSTED_DOMAIN_NOT_FOUND,
  ),
): asserts trustedDomain is WorkspaceTrustedDomain => {
  if (!isDefined(trustedDomain)) {
    throw exceptionToThrow;
  }
};

export const workspaceTrustedDomainValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
} = {
  assertIsDefinedOrThrow,
};
