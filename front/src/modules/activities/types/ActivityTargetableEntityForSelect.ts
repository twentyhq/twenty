import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';

import { ActivityTargetableEntityType } from './ActivityTargetableEntity';

export type ActivityTargetableEntityForSelect = EntityForSelect & {
  entityType: ActivityTargetableEntityType;
};
