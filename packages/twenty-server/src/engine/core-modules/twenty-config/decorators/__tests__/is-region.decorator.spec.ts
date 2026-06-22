import { validate } from 'class-validator';

import { IsRegion } from 'src/engine/core-modules/twenty-config/decorators/is-region.decorator';

class AwsOnlyConfig {
  @IsRegion()
  region?: string;
}

class S3Config {
  @IsRegion('endpoint')
  region?: string;

  endpoint?: string;
}

const getRegionErrors = async (instance: object) => {
  const errors = await validate(instance);

  return errors.filter((error) => error.property === 'region');
};

describe('IsRegion Decorator', () => {
  it('should accept an AWS-shaped region', async () => {
    const config = new AwsOnlyConfig();

    config.region = 'eu-west-3';

    expect(await getRegionErrors(config)).toHaveLength(0);
  });

  it('should reject a non-AWS-shaped region when no relaxing property is set', async () => {
    const config = new AwsOnlyConfig();

    config.region = 'fr-par';

    expect(await getRegionErrors(config)).toHaveLength(1);
  });

  it('should still enforce the AWS format when the relaxing property is absent', async () => {
    const config = new S3Config();

    config.region = 'fr-par';

    expect(await getRegionErrors(config)).toHaveLength(1);
  });

  it('should accept a non-AWS region slug when the relaxing property is set', async () => {
    const config = new S3Config();

    config.region = 'fr-par';
    config.endpoint = 'https://s3.fr-par.scw.cloud';

    expect(await getRegionErrors(config)).toHaveLength(0);
  });

  it('should reject a blank region even when the relaxing property is set', async () => {
    const config = new S3Config();

    config.region = '   ';
    config.endpoint = 'https://s3.fr-par.scw.cloud';

    expect(await getRegionErrors(config)).toHaveLength(1);
  });

  it('should accept an AWS-shaped region when the relaxing property is set', async () => {
    const config = new S3Config();

    config.region = 'eu-west-3';
    config.endpoint = 'https://s3.fr-par.scw.cloud';

    expect(await getRegionErrors(config)).toHaveLength(0);
  });
});
