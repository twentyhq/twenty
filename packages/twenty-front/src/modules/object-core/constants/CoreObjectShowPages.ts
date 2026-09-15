import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';

type CoreObjectShowPageComponent = LazyExoticComponent<
  ComponentType<CoreObjectShowPageProps>
>;

export const CORE_OBJECT_SHOW_PAGES: ReadonlyMap<
  string,
  CoreObjectShowPageComponent
> = new Map<CoreObjectNameSingular, CoreObjectShowPageComponent>([
  [
    CoreObjectNameSingular.Workflow,
    lazy(() =>
      import('~/pages/object-core/WorkflowCoreShowPage').then((module) => ({
        default: module.WorkflowCoreShowPage,
      })),
    ),
  ],
]);
