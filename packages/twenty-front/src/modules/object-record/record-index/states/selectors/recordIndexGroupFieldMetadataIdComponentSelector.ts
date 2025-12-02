import { recordIndexGroupFieldMetadataItemComponentState } from '@/object-record/record-index/states/recordIndexGroupFieldMetadataComponentState';
import { createComponentSelector } from '@/ui/utilities/state/component-state/utils/createComponentSelector';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const recordIndexGroupFieldMetadataIdComponentSelector =
  createComponentSelector<string | undefined>({
    key: 'recordIndexGroupFieldMetadataIdComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const fieldMetadataItem = get(
          recordIndexGroupFieldMetadataItemComponentState.atomFamily({
            instanceId,
          }),
        );

        return fieldMetadataItem?.id;
      },
  });
