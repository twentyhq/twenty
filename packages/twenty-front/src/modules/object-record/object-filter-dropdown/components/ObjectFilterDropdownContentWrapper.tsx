import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { filterValueFieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/filterValueFieldMetadataItemUsedInDropdownComponentSelector';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { getFilterTypeFromFieldType, isDefined } from 'twenty-shared/utils';

export const ObjectFilterDropdownContentWrapper = ({
  children,
}: React.PropsWithChildren) => {
  const filterValueFieldMetadataItem = useAtomComponentSelectorValue(
    filterValueFieldMetadataItemUsedInDropdownComponentSelector,
  );

  if (!isDefined(filterValueFieldMetadataItem)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    filterValueFieldMetadataItem.type,
  );

  const isDateFilter = DATE_FILTER_TYPES.includes(filterType);

  return (
    <LegacyDropdownContent
      widthInPixels={
        isDateFilter
          ? DATE_PICKER_DROPDOWN_CONTENT_WIDTH
          : GenericDropdownContentWidth.ExtraLarge
      }
    >
      {children}
    </LegacyDropdownContent>
  );
};
