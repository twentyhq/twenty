import { LIKELIHOOD_RANGE } from 'src/constants/likelihood-range';

export const isValidLikelihood = (likelihood: number): boolean =>
  Number.isInteger(likelihood) &&
  likelihood >= LIKELIHOOD_RANGE.min &&
  likelihood <= LIKELIHOOD_RANGE.max;
