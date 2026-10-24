export const getApplicationMonitoringChartValueFormat = ({
  hasIntegerValues,
  maxValue,
}: {
  hasIntegerValues: boolean;
  maxValue: number;
}): string => {
  if (hasIntegerValues) {
    return '>-,.0f';
  }

  if (maxValue < 1) {
    return '>-,.2~r';
  }

  return '>-,.2~f';
};
