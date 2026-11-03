import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';

import { ConfigVariables } from 'src/engine/core-modules/twenty-config/config-variables';

const getLogicFunctionTypeValidationErrors = (
  config: Record<string, unknown>,
) =>
  validateSync(plainToClass(ConfigVariables, config), {
    strictGroups: true,
  }).filter((error) => error.property === 'LOGIC_FUNCTION_TYPE');

describe('ConfigVariables', () => {
  describe('LOGIC_FUNCTION_TYPE', () => {
    it.each([
      [{}, 1],
      [{ LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET: 'layer-bucket' }, 0],
      [{ STORAGE_S3_NAME: 'storage-bucket' }, 0],
    ])(
      'should require a layer bucket for the Lambda driver with %o',
      (bucketConfig, expectedErrorCount) => {
        expect(
          getLogicFunctionTypeValidationErrors({
            LOGIC_FUNCTION_TYPE: 'LAMBDA',
            ...bucketConfig,
          }),
        ).toHaveLength(expectedErrorCount);
      },
    );
  });
});
