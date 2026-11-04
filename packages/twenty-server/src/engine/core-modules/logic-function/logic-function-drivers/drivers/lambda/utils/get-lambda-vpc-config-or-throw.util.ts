import { isNonEmptyString } from '@sniptt/guards';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { type LambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import {
  LogicFunctionException,
  LogicFunctionExceptionCode,
} from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const getLambdaVpcConfigOrThrow = ({
  subnetIds,
  securityGroupIds,
}: {
  subnetIds: string[] | undefined;
  securityGroupIds: string[] | undefined;
}): LambdaVpcConfig | undefined => {
  const nonEmptySubnetIds = (subnetIds ?? []).filter(isNonEmptyString);
  const nonEmptySecurityGroupIds = (securityGroupIds ?? []).filter(
    isNonEmptyString,
  );

  if (
    !isNonEmptyArray(nonEmptySubnetIds) &&
    !isNonEmptyArray(nonEmptySecurityGroupIds)
  ) {
    return undefined;
  }

  if (
    !isNonEmptyArray(nonEmptySubnetIds) ||
    !isNonEmptyArray(nonEmptySecurityGroupIds)
  ) {
    throw new LogicFunctionException(
      'LOGIC_FUNCTION_LAMBDA_SUBNET_IDS and LOGIC_FUNCTION_LAMBDA_SECURITY_GROUP_IDS must be set together to run logic functions inside a VPC',
      LogicFunctionExceptionCode.LOGIC_FUNCTION_PLATFORM_EXECUTION_ERROR,
    );
  }

  return {
    subnetIds: nonEmptySubnetIds,
    securityGroupIds: nonEmptySecurityGroupIds,
  };
};
