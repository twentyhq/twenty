import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectFrontComponentId = (
  context: FrontComponentExecutionContext | undefined,
): string | undefined => context?.frontComponentId;

export const useFrontComponentId = (): string | undefined => {
  return useFrontComponentExecutionContext(selectFrontComponentId);
};
