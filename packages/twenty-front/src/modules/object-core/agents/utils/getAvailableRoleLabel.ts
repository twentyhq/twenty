export const getAvailableRoleLabel = ({
  label,
  takenLabels,
}: {
  label: string;
  takenLabels: string[];
}) => {
  let availableLabel = label;
  let suffix = 2;

  while (takenLabels.includes(availableLabel)) {
    availableLabel = `${label} ${suffix}`;
    suffix += 1;
  }

  return availableLabel;
};
