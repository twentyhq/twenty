import { EntityForSelect } from '@/ui/Input/Relation Picker/types/EntityForSelect';

import { ActivityTargetableEntityType } from './ActivityTargetableEntity';

export type ActivityTargetableEntityForSelect = EntityForSelect & {
  entityType: ActivityTargetableEntityType;
};
