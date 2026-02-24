import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';

export type ScrollMeasurement = {
  scrollToTop: number;
  timestamp: number;
};

export const lastScrollMeasurementsComponentState = createComponentStateV2<
  ScrollMeasurement[]
>({
  key: 'lastScrollMeasurementsComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: [],
});
