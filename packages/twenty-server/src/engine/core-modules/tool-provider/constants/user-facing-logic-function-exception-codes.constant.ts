import { LogicFunctionExceptionCode } from 'src/engine/metadata-modules/logic-function/logic-function.exception';

export const USER_FACING_LOGIC_FUNCTION_EXCEPTION_CODES = [
  LogicFunctionExceptionCode.LOGIC_FUNCTION_DISABLED,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_COMPILATION_FAILED,
  LogicFunctionExceptionCode.LOGIC_FUNCTION_DEPENDENCIES_SIZE_EXCEEDED,
  LogicFunctionExceptionCode.INVALID_LOGIC_FUNCTION_INPUT,
];
