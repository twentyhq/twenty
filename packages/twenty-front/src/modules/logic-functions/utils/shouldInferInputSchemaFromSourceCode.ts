import { isDefined } from 'twenty-shared/utils';

const INFERRED_INPUT_SCHEMA_HANDLER_NAME = 'main';

export const shouldInferInputSchemaFromSourceCode = (
  logicFunction: { handlerName: string } | null,
): boolean => {
  if (!isDefined(logicFunction)) {
    return true;
  }

  return logicFunction.handlerName === INFERRED_INPUT_SCHEMA_HANDLER_NAME;
};
