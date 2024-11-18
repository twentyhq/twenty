import { recordGroupDefinitionsComponentState } from '@/object-record/record-group/states/recordGroupDefinitionsComponentState';

import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';

export const hasRecordGroupDefinitionsComponentSelector =
  createComponentSelectorV2<boolean>({
    key: 'hasRecordGroupDefinitionsComponentSelector',
    componentInstanceContext: ViewComponentInstanceContext,
    get:
      ({ instanceId }) =>
      ({ get }) => {
        const recordGroupDefinitions = get(
          recordGroupDefinitionsComponentState.atomFamily({
            instanceId,
          }),
        );

        return recordGroupDefinitions.length > 0;
      },
  });
