import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';

type CoreObjectShowPageComponent = LazyExoticComponent<
  ComponentType<CoreObjectShowPageProps>
>;

export const CORE_OBJECT_SHOW_PAGES: ReadonlyMap<
  string,
  CoreObjectShowPageComponent
> = new Map<StandardObjectNameSingular, CoreObjectShowPageComponent>([
  [
    StandardObjectNameSingular.Workflow,
    lazy(() =>
      import('~/pages/object-core/WorkflowCoreObjectShowPage').then(
        (module) => ({
          default: module.WorkflowCoreObjectShowPage,
        }),
      ),
    ),
  ],
]);
