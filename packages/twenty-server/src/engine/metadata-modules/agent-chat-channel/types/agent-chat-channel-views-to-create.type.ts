import { type UniversalFlatViewFilter } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view-filter.type';
import { type UniversalFlatView } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-view.type';

export type AgentChatChannelViewsToCreate = {
  viewsToCreate: (UniversalFlatView & { id: string })[];
  viewFiltersToCreate: (UniversalFlatViewFilter & { id: string })[];
};
