import { type FrontComponentExecutionContext } from '../types/FrontComponentExecutionContext';
import { useFrontComponentExecutionContext } from './useFrontComponentExecutionContext';

const selectColorScheme = (
  context: FrontComponentExecutionContext,
): 'Light' | 'Dark' => context.colorScheme;

/**
 * Returns the host's RESOLVED color scheme ('Light' | 'Dark'). The 'System'
 * preference is already collapsed to a concrete scheme on the host's main
 * thread, so front-components (which run in a Web Worker without matchMedia)
 * can theme correctly without any DOM access.
 */
export const useColorScheme = (): 'Light' | 'Dark' => {
  return useFrontComponentExecutionContext(selectColorScheme);
};
