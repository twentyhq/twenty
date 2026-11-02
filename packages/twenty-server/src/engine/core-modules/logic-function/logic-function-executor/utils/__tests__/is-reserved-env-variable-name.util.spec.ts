import { isReservedEnvVariableName } from 'src/engine/core-modules/logic-function/logic-function-executor/utils/is-reserved-env-variable-name.util';

describe('isReservedEnvVariableName', () => {
  it.each([
    'TWENTY_API_URL',
    'APPLICATION_ID',
    'TWENTY_FUTURE_VARIABLE',
    'TWENTY_',
  ])('should reserve %s', (name) => {
    expect(isReservedEnvVariableName(name)).toBe(true);
  });

  it.each(['APP_API_KEY', 'twenty_api_url', 'MY_TWENTY_VARIABLE', 'TWENTY'])(
    'should not reserve %s',
    (name) => {
      expect(isReservedEnvVariableName(name)).toBe(false);
    },
  );
});
