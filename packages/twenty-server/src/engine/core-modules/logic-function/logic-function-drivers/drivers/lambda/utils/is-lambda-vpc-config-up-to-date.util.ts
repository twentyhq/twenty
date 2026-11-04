import { type VpcConfigResponse } from '@aws-sdk/client-lambda';

import { type LambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';

const haveSameIds = ({
  expectedIds = [],
  currentIds = [],
}: {
  expectedIds: string[] | undefined;
  currentIds: string[] | undefined;
}): boolean => {
  const expectedIdSet = new Set(expectedIds);
  const currentIdSet = new Set(currentIds);

  return (
    expectedIdSet.size === currentIdSet.size &&
    [...expectedIdSet].every((id) => currentIdSet.has(id))
  );
};

export const isLambdaVpcConfigUpToDate = ({
  expectedVpcConfig,
  currentVpcConfig,
}: {
  expectedVpcConfig: LambdaVpcConfig | undefined;
  currentVpcConfig: VpcConfigResponse | undefined;
}): boolean =>
  haveSameIds({
    expectedIds: expectedVpcConfig?.subnetIds,
    currentIds: currentVpcConfig?.SubnetIds,
  }) &&
  haveSameIds({
    expectedIds: expectedVpcConfig?.securityGroupIds,
    currentIds: currentVpcConfig?.SecurityGroupIds,
  });
