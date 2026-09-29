import { ObjectFilterDropdownAnyFieldSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownAnyFieldSearchInput';
import { LegacyDropdownContent } from '@/ui/layout/dropdown/components/LegacyDropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { AnyFieldSearchDropdownContentMenuHeader } from '@/views/components/AnyFieldSearchDropdownContentMenuHeader';

export const AnyFieldSearchDropdownContent = () => {
  return (
    <LegacyDropdownContent
      widthInPixels={GenericDropdownContentWidth.ExtraLarge}
    >
      <AnyFieldSearchDropdownContentMenuHeader />
      <ObjectFilterDropdownAnyFieldSearchInput />
    </LegacyDropdownContent>
  );
};
