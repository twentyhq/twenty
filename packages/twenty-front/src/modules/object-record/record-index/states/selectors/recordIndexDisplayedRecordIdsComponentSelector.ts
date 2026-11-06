import { recordGroupIdsComponentState } from '@/object-record/record-group/states/recordGroupIdsComponentState';
import { activeRecordGroupTabIdComponentSelector } from '@/object-record/record-group/states/selectors/activeRecordGroupTabIdComponentSelector';
import { isRecordGroupTabsDisplayedComponentSelector } from '@/object-record/record-group/states/selectors/isRecordGroupTabsDisplayedComponentSelector';
import { visibleRecordGroupIdsComponentFamilySelector } from '@/object-record/record-group/states/selectors/visibleRecordGroupIdsComponentFamilySelector';
import { recordIndexRecordIdsByGroupComponentFamilyState } from '@/object-record/record-index/states/recordIndexRecordIdsByGroupComponentFamilyState';
import { recordIndexViewTypeState } from '@/object-record/record-index/states/recordIndexViewTypeState';
import { recordIndexAllRecordIdsComponentSelector } from '@/object-record/record-index/states/selectors/recordIndexAllRecordIdsComponentSelector';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { isDefined } from 'twenty-shared/utils';

export const recordIndexDisplayedRecordIdsComponentSelector =
  createAtomComponentSelector<string[]>({
    key: 'recordIndexDisplayedRecordIdsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupIds = get(recordGroupIdsComponentState, {
          instanceId,
        });
        const viewType = get(recordIndexViewTypeState, { instanceId });

        if (recordGroupIds.length === 0 || !isDefined(viewType)) {
          return get(recordIndexAllRecordIdsComponentSelector, { instanceId });
        }

        if (get(isRecordGroupTabsDisplayedComponentSelector, { instanceId })) {
          const activeRecordGroupTabId = get(
            activeRecordGroupTabIdComponentSelector,
            { instanceId },
          );

          return isDefined(activeRecordGroupTabId)
            ? get(recordIndexRecordIdsByGroupComponentFamilyState, {
                instanceId,
                familyKey: activeRecordGroupTabId,
              })
            : [];
        }

        return get(visibleRecordGroupIdsComponentFamilySelector, {
          instanceId,
          familyKey: viewType,
        }).flatMap((recordGroupId) =>
          get(recordIndexRecordIdsByGroupComponentFamilyState, {
            instanceId,
            familyKey: recordGroupId,
          }),
        );
      },
  });
