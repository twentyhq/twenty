import { t } from '@lingui/core/macro';

export const getAgentRoleLabel = ({
  agentLabel,
  roleLabels,
}: {
  agentLabel: string;
  roleLabels: string[];
}): string => {
  const baseLabel = t`${agentLabel} Agent Role`;
  const existingLabels = new Set(roleLabels);
  let label = baseLabel;
  let suffix = 2;

  while (existingLabels.has(label)) {
    label = `${baseLabel} ${suffix}`;
    suffix += 1;
  }

  return label;
};
