import { type FrontComponentExecutionContext } from 'twenty-sdk/front-component';

import { getFrontComponentExecutionContext } from '@/remote/worker/environment/utils/getFrontComponentExecutionContext';

const DEFAULT_COLOR_SCHEME: FrontComponentExecutionContext['colorScheme'] =
  'light';

export const getFrontComponentColorScheme =
  (): FrontComponentExecutionContext['colorScheme'] =>
    getFrontComponentExecutionContext()?.colorScheme ?? DEFAULT_COLOR_SCHEME;
