import { type ComponentProps } from 'react';

import { type FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { lazyWithPreload } from '~/utils/lazyWithPreload';

export const LazyFrontComponentRenderer = lazyWithPreload<
  ComponentProps<typeof FrontComponentRenderer>
>(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);
