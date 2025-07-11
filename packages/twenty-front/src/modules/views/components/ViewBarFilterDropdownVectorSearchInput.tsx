import { ObjectFilterDropdownVectorSearchInput } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownVectorSearchInput';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { ViewBarFilterDropdownFilterInputMenuHeader } from '@/views/components/ViewBarFilterDropdownFilterInputMenuHeader';

export const ViewBarFilterDropdownVectorSearchInput = () => {
  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      <ViewBarFilterDropdownFilterInputMenuHeader />
      <ObjectFilterDropdownVectorSearchInput />
    </DropdownContent>
  );
};
