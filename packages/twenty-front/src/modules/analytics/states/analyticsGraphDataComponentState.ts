import { AnalyticsGraphDataInstanceContext } from '@/analytics/states/contexts/AnalyticsGraphDataInstanceContext';
import { NivoLineInput } from '@/analytics/types/NivoLineInput';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
export const analyticsGraphDataComponentState = createComponentStateV2<
  NivoLineInput[]
>({
  key: 'analyticsGraphDataComponentState',
  defaultValue: [],
  componentInstanceContext: AnalyticsGraphDataInstanceContext,
});
