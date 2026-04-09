import { registerEnumType } from '@nestjs/graphql';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(ProjectStatus, {
  name: 'ProjectStatus',
  description: 'Project status',
});
