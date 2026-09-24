import { type NthFormula } from '@/polyfills/selectors/types/NthFormula';

export const doesPositionMatchNthFormula = ({
  position,
  nthFormula: { step, offset },
}: {
  position: number;
  nthFormula: NthFormula;
}): boolean => {
  const distanceFromOffset = position - offset;

  if (step === 0) {
    return distanceFromOffset === 0;
  }

  return distanceFromOffset % step === 0 && distanceFromOffset / step >= 0;
};
