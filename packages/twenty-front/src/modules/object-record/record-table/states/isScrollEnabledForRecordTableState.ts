import { RecordTableComponentInstanceContext } from '@/object-record/record-table/states/context/RecordTableComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';

export type ScrollEnabled = {
  enableXScroll: boolean;
  enableYScroll: boolean;
};

export const isScrollEnabledForRecordTableState =
  createComponentStateV2<ScrollEnabled>({
    key: 'isScrollEnabledForRecordTableState',
    defaultValue: {
      enableXScroll: true,
      enableYScroll: true,
    },
    componentInstanceContext: RecordTableComponentInstanceContext,
  });
