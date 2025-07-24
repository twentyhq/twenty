import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useSetRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentStateV2';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const useOpenAnyFieldSearchFilterFromViewBar = () => {
  const setAnyFieldFilterValue = useSetRecoilComponentStateV2(
    anyFieldFilterValueComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const setObjectFilterDropdownAnyFieldSearchIsSelectedComponentState =
    useSetRecoilComponentStateV2(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const objectFilterDropdownSearchInput = useRecoilComponentValueV2(
    objectFilterDropdownSearchInputComponentState,
  );

  const translatedLabel = t`Search any field`;

  const openAnyFieldSearchFilterFromViewBar = () => {
    const userHasAlreadyEnteredSearchInputForObjectDropdownSearch =
      isNonEmptyString(objectFilterDropdownSearchInput);

    const userInputIsMatchingAListMenuItem =
      objectMetadataItem.fields.some((fieldMetadataItem) =>
        fieldMetadataItem.label
          .toLocaleLowerCase()
          .includes(objectFilterDropdownSearchInput.toLocaleLowerCase()),
      ) ||
      translatedLabel
        .toLocaleLowerCase()
        .includes(objectFilterDropdownSearchInput.toLocaleLowerCase());

    if (
      userHasAlreadyEnteredSearchInputForObjectDropdownSearch &&
      !userInputIsMatchingAListMenuItem
    ) {
      const filterValue = objectFilterDropdownSearchInput;

      setAnyFieldFilterValue(filterValue);
    }

    setObjectFilterDropdownAnyFieldSearchIsSelectedComponentState(true);
  };

  return {
    openAnyFieldSearchFilterFromViewBar,
  };
};
