import { isNonEmptyString } from '@sniptt/guards';
import { type ToolApproval, type ToolApprovalLabels } from 'twenty-shared/ai';
import { type ToolTriggerApprovalSettings } from 'twenty-shared/application';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

// an alternative the caller cannot run as a tool is dropped rather than shown as a dead button
export const buildLogicFunctionToolApproval = ({
  approvalSettings,
  findAlternativeToolName,
}: {
  approvalSettings: ToolTriggerApprovalSettings | undefined;
  findAlternativeToolName: (
    logicFunctionUniversalIdentifier: string,
  ) => string | undefined;
}): ToolApproval | undefined => {
  if (!isDefined(approvalSettings)) {
    return undefined;
  }

  const alternativeLabels: NonNullable<ToolApprovalLabels['alternatives']> = {};

  for (const alternative of approvalSettings.alternatives ?? []) {
    const toolName = findAlternativeToolName(
      alternative.logicFunctionUniversalIdentifier,
    );

    if (isDefined(toolName) && isNonEmptyString(alternative.label)) {
      alternativeLabels[toolName] = {
        label: alternative.label,
        ...(isNonEmptyString(alternative.confirmLabel) && {
          confirmLabel: alternative.confirmLabel,
        }),
      };
    }
  }

  const alternativeToolNames = Object.keys(alternativeLabels);

  return {
    template: 'generic',
    ...(isNonEmptyArray(alternativeToolNames) && { alternativeToolNames }),
    labels: {
      ...(isNonEmptyString(approvalSettings.approveLabel) && {
        approve: approvalSettings.approveLabel,
      }),
      ...(isNonEmptyString(approvalSettings.rejectLabel) && {
        reject: approvalSettings.rejectLabel,
      }),
      ...(isNonEmptyArray(alternativeToolNames) && {
        alternatives: alternativeLabels,
      }),
    },
  };
};
