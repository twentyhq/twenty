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
      [{ LOGIC_FUNCTION_TYPE: 'LAMBDA' }, 1],
      [
        {
          LOGIC_FUNCTION_TYPE: 'LAMBDA',
          LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET: 'layer-bucket',
        },
        0,
      ],
      [{ LOGIC_FUNCTION_TYPE: 'LAMBDA', STORAGE_S3_NAME: 'storage-bucket' }, 0],
      [
        {
          LOGIC_FUNCTION_TYPE: 'LAMBDA',
          LOGIC_FUNCTION_LAMBDA_LAYER_BUCKET: '',
          STORAGE_S3_NAME: 'storage-bucket',
        },
        0,
      ],
      [{ LOGIC_FUNCTION_TYPE: 'LOCAL' }, 0],
    ])(
      'should validate the layer bucket of %o with %i error(s)',
      (config, expectedErrorCount) => {
        expect(getLogicFunctionTypeValidationErrors(config)).toHaveLength(
          expectedErrorCount,
        );
      },
    );
  });
});
