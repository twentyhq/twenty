import { isDefined } from 'twenty-shared/utils';

import { type CustomException } from 'src/utils/custom-exception';
import { type ApprovedAccessDomainEntity } from 'src/engine/core-modules/approved-access-domain/approved-access-domain.entity';
import {
  ApprovedAccessDomainException,
  ApprovedAccessDomainExceptionCode,
} from 'src/engine/core-modules/approved-access-domain/approved-access-domain.exception';

const assertIsDefinedOrThrow = (
  approvedAccessDomain: ApprovedAccessDomainEntity | undefined | null,
  exceptionToThrow: CustomException = new ApprovedAccessDomainException(
    'Approved access domain not found',
    ApprovedAccessDomainExceptionCode.APPROVED_ACCESS_DOMAIN_NOT_FOUND,
  ),
): asserts approvedAccessDomain is ApprovedAccessDomainEntity => {
  if (!isDefined(approvedAccessDomain)) {
    throw exceptionToThrow;
  }
};

export const approvedAccessDomainValidator: {
  assertIsDefinedOrThrow: typeof assertIsDefinedOrThrow;
} = {
  assertIsDefinedOrThrow,
};
