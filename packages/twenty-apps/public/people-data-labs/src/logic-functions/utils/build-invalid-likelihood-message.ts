import { LIKELIHOOD_RANGE } from 'src/constants/likelihood-range';

export const buildInvalidLikelihoodMessage = (label: string): string =>
  `${label} must be an integer between ${LIKELIHOOD_RANGE.min} and ${LIKELIHOOD_RANGE.max}.`;
