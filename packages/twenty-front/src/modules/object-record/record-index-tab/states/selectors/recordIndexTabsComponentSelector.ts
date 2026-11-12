import { type RecordIndexTab } from '@/object-record/record-index-tab/types/RecordIndexTab';
import { recordIndexTabFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexTabFieldMetadataItemComponentState';
import { createAtomComponentSelector } from '@/ui/utilities/state/jotai/utils/createAtomComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexTabsComponentSelector = createAtomComponentSelector<
  RecordIndexTab[]
>({
  key: 'recordIndexTabsComponentSelector',
  componentInstanceContext: ViewComponentInstanceContext,
  get:
    ({ instanceId }) =>
    ({ get }) =>
      [
        ...(get(recordIndexTabFieldMetadataItemComponentState, { instanceId })
          ?.options ?? []),
      ]
        .sort(
          (firstOption, secondOption) =>
            firstOption.position - secondOption.position,
        )
        .map((option) => ({
          id: option.value,
          label: option.label,
          color: option.color,
        })),
});
