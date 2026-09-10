import { type IconComponent } from 'twenty-ui/icon';

import { type UsageResourceType } from '~/generated-metadata/graphql';

export type UsageLimitRow = {
  id: string;
  name: string;
  NameIcon: IconComponent;
  spenderName: string;
  spenderAvatarUrl: string | null;
  spenderType: string;
  resourceType: UsageResourceType | null;
  consumedPercentage: number | null;
  consumedText: string | null;
  limitText: string;
  isExhausted: boolean;
  periodName: string;
};
