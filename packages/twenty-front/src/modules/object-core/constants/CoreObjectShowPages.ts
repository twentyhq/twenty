import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import {
  INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
} from 'twenty-shared/ai';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { type CoreObjectShowPageProps } from '@/object-core/types/CoreObjectShowPageProps';

type CoreObjectShowPageComponent = LazyExoticComponent<
  ComponentType<CoreObjectShowPageProps>
>;

export const CORE_OBJECT_SHOW_PAGES: ReadonlyMap<
  string,
  CoreObjectShowPageComponent
> = new Map<string, CoreObjectShowPageComponent>([
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
  // TODO(@bosiraphael): remove the legacy entry with IS_INBOX_OBJECT_NAMING_ENABLED
  [
    LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME.agentChatThread,
    lazy(() =>
      import('@/inbox/components/AiChatThreadRecordView').then((module) => ({
        default: module.AiChatThreadRecordView,
      })),
    ),
  ],
  [
    INBOX_OBJECT_NAMES_BY_LEGACY_NAME.agentChatThread,
    lazy(() =>
      import('@/inbox/components/AiChatThreadRecordView').then((module) => ({
        default: module.AiChatThreadRecordView,
      })),
    ),
  ],
]);
