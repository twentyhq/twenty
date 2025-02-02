import { SectorTopic } from '@/settings/service-center/sectors/types/SectorTopic';

export interface CreateSectorInput {
  icon: string;
  name: string;
  topics: SectorTopic[];
  workspaceId?: string;
}
