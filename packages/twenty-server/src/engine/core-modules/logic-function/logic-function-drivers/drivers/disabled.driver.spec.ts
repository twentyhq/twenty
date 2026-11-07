import { DisabledDriver } from 'src/engine/core-modules/logic-function/logic-function-drivers/drivers/disabled.driver';
import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

describe('DisabledDriver', () => {
  it.each(['transpile', 'buildDependencies'] as const)(
    'rejects %s when builds are disabled',
    async (operation) => {
      await expect(new DisabledDriver()[operation]()).rejects.toMatchObject({
        code: LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
      });
    },
  );
});
