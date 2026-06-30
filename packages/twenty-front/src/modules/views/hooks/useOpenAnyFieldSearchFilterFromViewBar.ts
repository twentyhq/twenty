import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const useOpenAnyFieldSearchFilterFromViewBar = () => {
  const setAnyFieldFilterValue = useSetAtomComponentState(
    anyFieldFilterValueComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const setObjectFilterDropdownAnyFieldSearchIsSelected =
    useSetAtomComponentState(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const objectFilterDropdownSearchInput = useAtomComponentStateValue(
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

    setObjectFilterDropdownAnyFieldSearchIsSelected(true);
  };

  return {
    openAnyFieldSearchFilterFromViewBar,
  };
};
