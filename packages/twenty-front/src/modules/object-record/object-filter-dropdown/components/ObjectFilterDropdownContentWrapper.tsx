import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { DATE_FILTER_TYPES } from '@/object-record/object-filter-dropdown/constants/DateFilterTypes';
import { DATE_PICKER_DROPDOWN_CONTENT_WIDTH } from '@/object-record/object-filter-dropdown/constants/DatePickerDropdownContentWidth';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { isDefined } from 'twenty-shared/utils';

export const ObjectFilterDropdownContentWrapper = ({
  children,
}: React.PropsWithChildren) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValue(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }

  const filterType = getFilterTypeFromFieldType(
    fieldMetadataItemUsedInDropdown.type,
  );

  const isDateFilter = DATE_FILTER_TYPES.includes(filterType);

  return (
    <DropdownContent
      widthInPixels={
        isDateFilter
          ? DATE_PICKER_DROPDOWN_CONTENT_WIDTH
          : GenericDropdownContentWidth.ExtraLarge
      }
    >
      {children}
    </DropdownContent>
  );
};
