import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { RECORD_INDEX_ALL_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexAllTabId';
import { RECORD_INDEX_NO_VALUE_TAB_ID } from '@/object-record/record-index-tab/constants/RecordIndexNoValueTabId';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

// The active tab narrows the view like a filter the user cannot edit or save
export const recordIndexTabRecordFiltersComponentSelector =
  createAtomComponentSelector<RecordFilter[]>({
    key: 'recordIndexTabRecordFiltersComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const activeRecordIndexTabId = get(
          activeRecordIndexTabIdComponentSelector,
          { instanceId },
        );

        const recordIndexTabFieldMetadataItem = get(
          recordIndexTabFieldMetadataItemComponentState,
          { instanceId },
        );

        if (
          activeRecordIndexTabId === RECORD_INDEX_ALL_TAB_ID ||
          !isDefined(recordIndexTabFieldMetadataItem)
        ) {
          return [];
        }

        const isNoValueTab =
          activeRecordIndexTabId === RECORD_INDEX_NO_VALUE_TAB_ID;

        return [
          {
            id: `record-index-tab-${recordIndexTabFieldMetadataItem.id}`,
            fieldMetadataId: recordIndexTabFieldMetadataItem.id,
            value: isNoValueTab ? '' : JSON.stringify([activeRecordIndexTabId]),
            operand: isNoValueTab
              ? ViewFilterOperand.IS_EMPTY
              : ViewFilterOperand.IS,
            displayValue: '',
            type: getFilterTypeFromFieldType(
              recordIndexTabFieldMetadataItem.type,
            ),
            label: recordIndexTabFieldMetadataItem.label,
          },
        ];
      },
  });
