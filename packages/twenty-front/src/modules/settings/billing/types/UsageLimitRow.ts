import { type IconComponent } from 'twenty-ui/icon';

import {
  type UsageResourceType,
  type UsageUnit,
} from '~/generated-metadata/graphql';

export type UsageLimitRow = {
  id: string;
  name: string;
  NameIcon: IconComponent;
  spenderName: string;
  spenderAvatarUrl: string | null;
  spenderType: string;
  resourceType: UsageResourceType | null;
  isEnforced: boolean;
  consumedPercentage: number | null;
  consumedText: string | null;
  limitText: string;
  unit: UsageUnit;
  isExhausted: boolean;
  periodName: string;
};
