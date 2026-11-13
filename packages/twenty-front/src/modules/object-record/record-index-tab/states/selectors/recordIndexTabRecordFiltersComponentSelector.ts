import { flattenedFieldMetadataItemsSelector } from '@/object-metadata/states/flattenedFieldMetadataItemsSelector';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { recordIndexViewTabsComponentState } from '@/object-record/record-index-tab/states/recordIndexViewTabsComponentState';
import { activeRecordIndexTabIdComponentSelector } from '@/object-record/record-index-tab/states/selectors/activeRecordIndexTabIdComponentSelector';
import { visibleRecordIndexTabsComponentSelector } from '@/object-record/record-index-tab/states/selectors/visibleRecordIndexTabsComponentSelector';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { mapViewFiltersToFilters } from '@/views/utils/mapViewFiltersToFilters';
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

        const activeRecordIndexTab = get(
          visibleRecordIndexTabsComponentSelector,
          { instanceId },
        ).find(({ id }) => id === activeRecordIndexTabId);

        if (!isDefined(activeRecordIndexTab)) {
          return [];
        }

        if (activeRecordIndexTab.kind === 'custom') {
          const activeViewTab = get(recordIndexViewTabsComponentState, {
            instanceId,
          }).find(({ id }) => id === activeRecordIndexTab.viewTabId);

          return mapViewFiltersToFilters(
            activeViewTab?.viewFilters ?? [],
            get(flattenedFieldMetadataItemsSelector),
          );
        }

        const recordIndexTabFieldMetadataItem = get(
          recordIndexTabFieldMetadataItemComponentState,
          { instanceId },
        );

        if (
          activeRecordIndexTab.kind === 'all' ||
          !isDefined(recordIndexTabFieldMetadataItem)
        ) {
          return [];
        }

        const isNoValueTab = activeRecordIndexTab.kind === 'noValue';

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
