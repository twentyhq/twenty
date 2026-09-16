export const getInstallCountEstimate = (
  installCount: number,
): number | undefined => {
  if (!Number.isInteger(installCount) || installCount < 10) {
    return undefined;
  }

  const orderOfMagnitude = 10 ** (String(installCount).length - 1);
  const estimate =
    Math.floor(installCount / orderOfMagnitude) * orderOfMagnitude;

  // "+40 installs" would misread as more than 40 when the count is exactly 40
  return estimate === installCount ? undefined : estimate;
};
