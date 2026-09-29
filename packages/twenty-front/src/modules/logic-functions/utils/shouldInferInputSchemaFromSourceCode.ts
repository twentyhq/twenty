import { isDefined } from 'twenty-shared/utils';

export const shouldInferInputSchemaFromSourceCode = (
  logicFunction: { handlerName: string } | null,
): boolean => {
  if (!isDefined(logicFunction)) {
    return true;
  }

  return !logicFunction.handlerName.includes('.');
};
