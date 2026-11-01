import { type MessageDescriptor } from '@lingui/core';
import { type IconComponent } from 'twenty-ui/icon';

import { type UsageLimitPeriodUnit } from '@/settings/billing/types/UsageLimitPeriodUnit';
import { type UsageLimitSpenderType } from '@/settings/billing/types/UsageLimitSpenderType';
import {
  type UsageOperationType,
  type UsageResourceType,
  type UsageUnit,
} from '~/generated-metadata/graphql';

export type UsageLimitPreset = {
  Icon: IconComponent;
  title: MessageDescriptor;
  description: MessageDescriptor;
  values: {
    resourceType: UsageResourceType;
    operationType: UsageOperationType;
    spenderType: UsageLimitSpenderType;
    unit: UsageUnit;
    periodUnit: UsageLimitPeriodUnit;
  };
};
