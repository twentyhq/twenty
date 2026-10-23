import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { type FrontComponentLocation } from '../types/FrontComponentLocation';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectLocation = (
  context: FrontComponentExecutionContext,
): FrontComponentLocation | null => context.location ?? null;

export const useLocation = (): FrontComponentLocation | null => {
  return useFrontComponentExecutionContext(selectLocation);
};
