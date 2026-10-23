export const getAvailableRoleLabel = ({
  preferredLabel,
  takenLabels,
}: {
  preferredLabel: string;
  takenLabels: string[];
}): string => {
  let label = preferredLabel;

  for (let suffix = 2; takenLabels.includes(label); suffix++) {
    label = `${preferredLabel} ${suffix}`;
  }

  return label;
};
