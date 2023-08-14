import { EntityForSelect } from '@/ui/input/relation-picker/types/EntityForSelect';

import { ActivityTargetableEntityType } from './ActivityTargetableEntity';

export type ActivityTargetableEntityForSelect = EntityForSelect & {
  entityType: ActivityTargetableEntityType;
};
