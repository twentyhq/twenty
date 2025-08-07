import { objectFilterDropdownAnyFieldSearchIsSelectedComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownAnyFieldSearchIsSelectedComponentState';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { anyFieldFilterValueComponentState } from '@/object-record/record-filter/states/anyFieldFilterValueComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { useSetRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useSetRecoilComponentState';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';

export const useOpenAnyFieldSearchFilterFromViewBar = () => {
  const setAnyFieldFilterValue = useSetRecoilComponentState(
    anyFieldFilterValueComponentState,
  );

  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const setObjectFilterDropdownAnyFieldSearchIsSelectedComponentState =
    useSetRecoilComponentState(
      objectFilterDropdownAnyFieldSearchIsSelectedComponentState,
    );

  const objectFilterDropdownSearchInput = useRecoilComponentValue(
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
