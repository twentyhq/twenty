import { isDefined } from 'twenty-shared/utils';

export type UnsavedSourceHandlerCode = {
  sourceHandlerCode: string;
  // Undefined while the target is being resolved
  targetLogicFunctionId?: string;
};

export const shouldKeepUnsavedSourceHandlerCode = ({
  unsavedSourceHandlerCode,
  logicFunctionId,
}: {
  unsavedSourceHandlerCode: UnsavedSourceHandlerCode | undefined;
  logicFunctionId: string;
}): boolean =>
  isDefined(unsavedSourceHandlerCode) &&
  (!isDefined(unsavedSourceHandlerCode.targetLogicFunctionId) ||
    unsavedSourceHandlerCode.targetLogicFunctionId === logicFunctionId);
