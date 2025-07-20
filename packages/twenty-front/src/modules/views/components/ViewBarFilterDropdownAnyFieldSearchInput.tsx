import { ObjectFilterDropdownAnyFieldSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownAnyFieldSearchInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader } from '@/views/components/ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader';

export const ViewBarFilterDropdownAnyFieldSearchInput = () => {
  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <ViewBarFilterDropdownAnyFieldSearchInputDropdownHeader />
      <ObjectFilterDropdownAnyFieldSearchInput />
    </DropdownContent>
  );
};
