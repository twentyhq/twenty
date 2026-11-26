import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import { StandardObjectNameSingular } from 'twenty-shared/types';

import { INBOX_OBJECT_NAMES } from '@/ai-chat/constants/InboxObjectNames';
import { LEGACY_INBOX_OBJECT_NAMES } from '@/ai-chat/constants/LegacyInboxObjectNames';
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
  [
    LEGACY_INBOX_OBJECT_NAMES.agentChatThread,
    lazy(() =>
      import('@/inbox/components/AiChatThreadRecordView').then((module) => ({
        default: module.AiChatThreadRecordView,
      })),
    ),
  ],
  [
    INBOX_OBJECT_NAMES.agentChatThread,
    lazy(() =>
      import('@/inbox/components/AiChatThreadRecordView').then((module) => ({
        default: module.AiChatThreadRecordView,
      })),
    ),
  ],
]);
