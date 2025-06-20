import { TitleInputComponentInstanceContext } from '@/ui/input/contexts/titleInputComponentInstanceContext';
import { titleInputComponentState } from '@/ui/input/states/titleInputComponentState';
import { createComponentSelectorV2 } from '@/ui/utilities/state/component-state/utils/createComponentSelectorV2';

export const titleInputComponentSelector = createComponentSelectorV2({
  key: 'titleInputComponentSelector',
  get:
    ({ instanceId }) =>
    ({ get }) => {
      const isTitleInputOpen = get(
        titleInputComponentState.atomFamily({ instanceId }),
      );

      return isTitleInputOpen;
    },
  componentInstanceContext: TitleInputComponentInstanceContext,
});
