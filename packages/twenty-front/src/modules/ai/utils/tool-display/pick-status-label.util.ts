export const pickStatusLabel = ({
  isFinished,
  loadingLabel,
  completedLabel,
}: {
  isFinished: boolean;
  loadingLabel: string;
  completedLabel: string;
}): string => (isFinished ? completedLabel : loadingLabel);
