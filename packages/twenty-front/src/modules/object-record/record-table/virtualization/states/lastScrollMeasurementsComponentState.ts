import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export type ScrollMeasurement = {
  scrollToTop: number;
  timestamp: number;
};

export const lastScrollMeasurementsComponentState = createAtomComponentState<
  ScrollMeasurement[]
>({
  key: 'lastScrollMeasurementsComponentState',
  componentInstanceContext: RecordTableComponentInstanceContext,
  defaultValue: [],
});
