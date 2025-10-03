import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';

export type ScrollMeasurement = {
  scrollToTop: number;
  timestamp: number;
};

export const lastScrollMeasurementsComponentState = createComponentState<
  ScrollMeasurement[]
>({
  key: 'lastScrollMeasurementsComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: [],
});
