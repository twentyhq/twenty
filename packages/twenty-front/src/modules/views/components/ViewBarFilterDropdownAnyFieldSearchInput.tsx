import { ObjectFilterDropdownAnyFieldSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownAnyFieldSearchInput';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader';

export const ViewBarFilterDropdownAnyFieldSearchInput = () => {
  return (
    <LegacyDropdownContent
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
      <ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader />
      <ObjectFilterDropdownAnyFieldSearchInput />
    </LegacyDropdownContent>
  );
};
