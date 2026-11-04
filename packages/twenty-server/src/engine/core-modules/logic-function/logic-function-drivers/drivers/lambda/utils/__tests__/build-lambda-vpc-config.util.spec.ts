import { buildLambdaVpcConfig } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/build-lambda-vpc-config.util';

describe('buildLambdaVpcConfig', () => {
  it('attaches the configured subnets and security groups', () => {
    expect(
      buildLambdaVpcConfig({
        expectedVpcConfig: {
          subnetIds: ['subnet-a'],
          securityGroupIds: ['sg-a'],
        },
        currentVpcConfig: undefined,
      }),
    ).toEqual({ SubnetIds: ['subnet-a'], SecurityGroupIds: ['sg-a'] });
  });

  it('detaches a function still in a VPC once the VPC setup is removed', () => {
    expect(
      buildLambdaVpcConfig({
        expectedVpcConfig: undefined,
        currentVpcConfig: {
          SubnetIds: ['subnet-a'],
          SecurityGroupIds: ['sg-a'],
          VpcId: 'vpc-a',
        },
      }),
    ).toEqual({ SubnetIds: [], SecurityGroupIds: [] });
  });

  it.each([undefined, { SubnetIds: [], SecurityGroupIds: [], VpcId: '' }])(
    'leaves a function outside any VPC untouched (%o)',
    (currentVpcConfig) => {
      expect(
        buildLambdaVpcConfig({
          expectedVpcConfig: undefined,
          currentVpcConfig,
        }),
      ).toBeUndefined();
    },
  );
});
