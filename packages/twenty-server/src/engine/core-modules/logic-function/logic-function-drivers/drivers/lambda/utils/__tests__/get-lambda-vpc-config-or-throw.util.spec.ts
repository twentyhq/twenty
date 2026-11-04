import { getLambdaVpcConfigOrThrow } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/lambda/utils/get-lambda-vpc-config-or-throw.util';

describe('getLambdaVpcConfigOrThrow', () => {
  it.each<{
    subnetIds: string[] | undefined;
    securityGroupIds: string[] | undefined;
  }>([
    { subnetIds: undefined, securityGroupIds: undefined },
    { subnetIds: [], securityGroupIds: [] },
    { subnetIds: [''], securityGroupIds: [''] },
  ])(
    'runs outside any VPC when nothing is configured ($subnetIds, $securityGroupIds)',
    ({ subnetIds, securityGroupIds }) => {
      expect(
        getLambdaVpcConfigOrThrow({ subnetIds, securityGroupIds }),
      ).toBeUndefined();
    },
  );

  it('returns the configured subnets and security groups without empty entries', () => {
    expect(
      getLambdaVpcConfigOrThrow({
        subnetIds: ['subnet-a', '', 'subnet-b'],
        securityGroupIds: ['sg-a'],
      }),
    ).toEqual({
      subnetIds: ['subnet-a', 'subnet-b'],
      securityGroupIds: ['sg-a'],
    });
  });

  it.each<{ subnetIds: string[]; securityGroupIds: string[] }>([
    { subnetIds: ['subnet-a'], securityGroupIds: [] },
    { subnetIds: [], securityGroupIds: ['sg-a'] },
  ])(
    'refuses a VPC setup missing subnets or security groups ($subnetIds, $securityGroupIds)',
    ({ subnetIds, securityGroupIds }) => {
      expect(() =>
        getLambdaVpcConfigOrThrow({ subnetIds, securityGroupIds }),
      ).toThrow(
        'LOGIC_FUNCTION_LAMBDA_SUBNET_IDS and LOGIC_FUNCTION_LAMBDA_SECURITY_GROUP_IDS must be set together',
      );
    },
  );
});
