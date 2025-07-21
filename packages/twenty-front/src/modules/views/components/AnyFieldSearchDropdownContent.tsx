import { ObjectFilterDropdownAnyFieldSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownAnyFieldSearchInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { AnyFieldSearchDropdownContentMenuHeader } from '@/views/components/AnyFieldSearchDropdownContentMenuHeader';

export const AnyFieldSearchDropdownContent = () => {
  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <AnyFieldSearchDropdownContentMenuHeader />
      <ObjectFilterDropdownAnyFieldSearchInput />
    </DropdownContent>
  );
};
