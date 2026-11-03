import { type ConditionalDisplayDevice } from 'twenty-shared/types';

export const getConditionalDisplayDevice = ({
  isMobile,
  isInSidePanel,
}: {
  isMobile: boolean;
  isInSidePanel: boolean;
}): ConditionalDisplayDevice =>
  isMobile || isInSidePanel ? 'MOBILE' : 'DESKTOP';
