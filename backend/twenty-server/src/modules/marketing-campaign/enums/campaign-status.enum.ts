import { registerEnumType } from '@nestjs/graphql';

export enum CampaignStatus {
  DRAFT = 'DRAFT',
  SCHEDULED = 'SCHEDULED',
  ACTIVE = 'ACTIVE',
  PAUSED = 'PAUSED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(CampaignStatus, {
  name: 'CampaignStatus',
  description: 'Campaign status',
});
