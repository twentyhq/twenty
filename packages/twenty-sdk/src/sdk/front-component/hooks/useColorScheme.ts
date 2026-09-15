import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectColorScheme = (
  context: FrontComponentExecutionContext,
): 'light' | 'dark' => context.colorScheme;

export const useColorScheme = (): 'light' | 'dark' => {
  return useFrontComponentExecutionContext(selectColorScheme);
};
