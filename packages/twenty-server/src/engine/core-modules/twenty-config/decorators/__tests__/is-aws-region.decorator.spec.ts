import { validateSync } from 'class-validator';

import { IsAWSRegion } from 'src/engine/core-modules/twenty-config/decorators/is-aws-region.decorator';

describe('IsAWSRegion', () => {
  class ConfigVariables {
    @IsAWSRegion()
    region: string;
  }

  // AWS partitions use different region naming formats:
  // https://github.com/boto/botocore/blob/e3ae2081184335ff69687f8dacc798e58715af1d/botocore/data/partitions.json
  it.each([
    'eu-west-1',
    'cn-north-1',
    'eusc-de-east-1',
    'us-gov-west-1',
    'us-iso-east-1',
    'us-isob-east-1',
    'eu-isoe-west-1',
    'us-isof-east-1',
  ])('should accept region %s', (region) => {
    const config = Object.assign(new ConfigVariables(), { region });

    expect(validateSync(config)).toHaveLength(0);
  });

  it('should accept multi-digit region numbers', () => {
    const config = Object.assign(new ConfigVariables(), {
      region: 'eu-west-10',
    });

    expect(validateSync(config)).toHaveLength(0);
  });

  it.each([
    '',
    'eu-west',
    'eu_west_1',
    'eu-west-1a',
    'eu-west-1-2',
    'us-gov--west-1',
    'eusc-de-east',
    'eusc-de-east-1a',
    'eusc-de-east-1-2',
    'eusc-de--east-1',
    'EUSC-de-east-1',
    ' eusc-de-east-1',
    'eusc-de-east-1 ',
    'aws-global',
  ])('should reject invalid region %s', (region) => {
    const config = Object.assign(new ConfigVariables(), { region });

    expect(validateSync(config)).toHaveLength(1);
  });
});
