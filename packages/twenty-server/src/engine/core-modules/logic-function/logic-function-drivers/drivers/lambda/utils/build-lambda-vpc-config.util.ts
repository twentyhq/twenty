import { type VpcConfig, type VpcConfigResponse } from '@aws-sdk/client-lambda';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { type LambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';

// Lambda keeps a function's VPC attachment when VpcConfig is omitted, so detaching needs empty lists.
export const buildLambdaVpcConfig = ({
  expectedVpcConfig,
  currentVpcConfig,
}: {
  expectedVpcConfig: LambdaVpcConfig | undefined;
  currentVpcConfig: VpcConfigResponse | undefined;
}): VpcConfig | undefined => {
  if (isDefined(expectedVpcConfig)) {
    return {
      SubnetIds: expectedVpcConfig.subnetIds,
      SecurityGroupIds: expectedVpcConfig.securityGroupIds,
    };
  }

  if (isNonEmptyArray(currentVpcConfig?.SubnetIds)) {
    return { SubnetIds: [], SecurityGroupIds: [] };
  }

  return undefined;
};
