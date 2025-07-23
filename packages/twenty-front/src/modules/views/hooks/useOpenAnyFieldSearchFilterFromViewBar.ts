import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { viewAnyFieldSearchValueComponentState } from '@/views/states/viewAnyFieldSearchValueComponentState';
import { isNonEmptyString } from '@sniptt/guards';

export const useOpenAnyFieldSearchFilterFromViewBar = () => {
  const setViewAnyFieldSearchValueComponentState = useSetRecoilComponentStateV2(
    viewAnyFieldSearchValueComponentState,
  );

  const setObjectFilterDropdownAnyFieldSearchIsSelectedComponentState =
    useSetRecoilComponentStateV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const openAnyFieldSearchFilterFromViewBar = () => {
    const userHasAlreadyEnteredSearchInputForObjectDropdownSearch =
      isNonEmptyString(objectFilterDropdownSearchInput);

    if (userHasAlreadyEnteredSearchInputForObjectDropdownSearch) {
      const filterValue = objectFilterDropdownSearchInput;

      setViewAnyFieldSearchValueComponentState(filterValue);
    }

    setObjectFilterDropdownAnyFieldSearchIsSelectedComponentState(true);
  };

  return {
    openAnyFieldSearchFilterFromViewBar,
  };
};
