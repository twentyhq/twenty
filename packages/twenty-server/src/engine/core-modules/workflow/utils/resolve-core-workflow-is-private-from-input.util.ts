import { WorkflowVisibility } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const resolveCoreWorkflowIsPrivateFromInput = ({
  isPrivate,
  visibility,
}: {
  isPrivate?: boolean;
  visibility?: WorkflowVisibility;
}): boolean | undefined => {
  if (isDefined(isPrivate)) {
    return isPrivate;
  }

  return isDefined(visibility)
    ? visibility === WorkflowVisibility.PRIVATE
    : undefined;
};
