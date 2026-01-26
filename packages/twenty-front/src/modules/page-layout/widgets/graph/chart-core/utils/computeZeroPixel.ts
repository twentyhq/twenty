import { computeValueScale } from '@/page-layout/widgets/graph/chart-core/utils/computeValueScale';

export const computeZeroPixel = ({
  domain,
  axisLength,
}: {
  domain: { min: number; max: number };
  axisLength: number;
}): number => {
  const { valueToPixel } = computeValueScale({ domain, axisLength });
  return valueToPixel(0);
};
