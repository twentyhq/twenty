import { isNonEmptyString } from '@sniptt/guards';
import { type ToolApproval } from 'twenty-shared/ai';
import { type ToolTriggerApprovalSettings } from 'twenty-shared/application';
import { TOOL_TRIGGER_APPROVAL_LABEL_CONTEXTS } from 'twenty-shared/i18n';

export const buildLogicFunctionToolApproval = ({
  approvalSettings,
  translateLabel,
}: {
  approvalSettings:
    | Pick<ToolTriggerApprovalSettings, 'approveLabel' | 'rejectLabel'>
    | undefined;
  translateLabel: (label: { message: string; context: string }) => string;
}): ToolApproval | undefined => {
  const approveLabel = approvalSettings?.approveLabel;
  const rejectLabel = approvalSettings?.rejectLabel;

  if (!isNonEmptyString(approveLabel) && !isNonEmptyString(rejectLabel)) {
    return undefined;
  }

  return {
    template: 'generic',
    labels: {
      ...(isNonEmptyString(approveLabel) && {
        approve: translateLabel({
          message: approveLabel,
          context: TOOL_TRIGGER_APPROVAL_LABEL_CONTEXTS.approveLabel,
        }),
      }),
      ...(isNonEmptyString(rejectLabel) && {
        reject: translateLabel({
          message: rejectLabel,
          context: TOOL_TRIGGER_APPROVAL_LABEL_CONTEXTS.rejectLabel,
        }),
      }),
    },
  };
};
