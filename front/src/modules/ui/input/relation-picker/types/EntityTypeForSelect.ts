import { ActivityTargetableEntityType } from '@/activities/types/ActivityTargetableEntity';

export enum Entity {
  Company = 'Company',
  Person = 'Person',
  User = 'User',
  WorkspaceMember = 'WorkspaceMember',
}

export type EntityTypeForSelect = ActivityTargetableEntityType | Entity;
