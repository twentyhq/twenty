import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';

export const CORE_OBJECT_SHOW_PAGES = new Map<
  CoreObjectNameSingular,
  LazyExoticComponent<ComponentType<CoreObjectShowPageProps>>
>([
  [
    CoreObjectNameSingular.Workflow,
    lazy(() =>
      import('~/pages/object-core/WorkflowCoreShowPage').then((module) => ({
        default: module.WorkflowCoreShowPage,
      })),
    ),
  ],
]);
