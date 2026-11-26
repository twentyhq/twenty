import { isNonEmptyString } from '@sniptt/guards';
import { type ToolApproval } from 'twenty-shared/ai';
import { type ToolTriggerApprovalSettings } from 'twenty-shared/application';

export const buildLogicFunctionToolApproval = (
  approvalSettings: ToolTriggerApprovalSettings | undefined,
): ToolApproval | undefined => {
  const approveLabel = approvalSettings?.approveLabel;
  const rejectLabel = approvalSettings?.rejectLabel;

  if (!isNonEmptyString(approveLabel) && !isNonEmptyString(rejectLabel)) {
    return undefined;
  }

  return {
    template: 'generic',
    labels: {
      ...(isNonEmptyString(approveLabel) && { approve: approveLabel }),
      ...(isNonEmptyString(rejectLabel) && { reject: rejectLabel }),
    },
  };
};
