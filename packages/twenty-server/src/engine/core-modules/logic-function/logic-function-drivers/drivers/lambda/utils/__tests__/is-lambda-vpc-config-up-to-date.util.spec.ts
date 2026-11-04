import { type VpcConfigResponse } from '@aws-sdk/client-lambda';

import { type LambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/types/lambda-driver.type';
import { isLambdaVpcConfigUpToDate } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/is-lambda-vpc-config-up-to-date.util';

const VPC_CONFIG: LambdaVpcConfig = {
  subnetIds: ['subnet-a', 'subnet-b'],
  securityGroupIds: ['sg-a'],
};

describe('isLambdaVpcConfigUpToDate', () => {
  it.each<{
    title: string;
    expectedVpcConfig: LambdaVpcConfig | undefined;
    currentVpcConfig: VpcConfigResponse | undefined;
    expected: boolean;
  }>([
    {
      title: 'no VPC configured and none attached',
      expectedVpcConfig: undefined,
      currentVpcConfig: undefined,
      expected: true,
    },
    {
      title: 'no VPC configured and an empty attachment reported',
      expectedVpcConfig: undefined,
      currentVpcConfig: { SubnetIds: [], SecurityGroupIds: [], VpcId: '' },
      expected: true,
    },
    {
      title: 'same subnets and security groups in another order',
      expectedVpcConfig: VPC_CONFIG,
      currentVpcConfig: {
        SubnetIds: ['subnet-b', 'subnet-a'],
        SecurityGroupIds: ['sg-a'],
      },
      expected: true,
    },
    {
      title: 'VPC configured but function outside any VPC',
      expectedVpcConfig: VPC_CONFIG,
      currentVpcConfig: undefined,
      expected: false,
    },
    {
      title: 'function in a VPC that is no longer configured',
      expectedVpcConfig: undefined,
      currentVpcConfig: { SubnetIds: ['subnet-a'], SecurityGroupIds: ['sg-a'] },
      expected: false,
    },
    {
      title: 'a subnet differs',
      expectedVpcConfig: VPC_CONFIG,
      currentVpcConfig: {
        SubnetIds: ['subnet-a', 'subnet-c'],
        SecurityGroupIds: ['sg-a'],
      },
      expected: false,
    },
    {
      title: 'a security group differs',
      expectedVpcConfig: VPC_CONFIG,
      currentVpcConfig: {
        SubnetIds: ['subnet-a', 'subnet-b'],
        SecurityGroupIds: ['sg-b'],
      },
      expected: false,
    },
  ])('$title', ({ expectedVpcConfig, currentVpcConfig, expected }) => {
    expect(
      isLambdaVpcConfigUpToDate({ expectedVpcConfig, currentVpcConfig }),
    ).toBe(expected);
  });
});
