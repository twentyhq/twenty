import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectFrontComponentId = (
  context: FrontComponentExecutionContext,
): string => context.frontComponentId;

export const useFrontComponentId = (): string => {
  return useFrontComponentExecutionContext(selectFrontComponentId);
};
