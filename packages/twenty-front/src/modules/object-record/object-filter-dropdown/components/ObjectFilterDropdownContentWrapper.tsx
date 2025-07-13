import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared/utils';

export const ObjectFilterDropdownContentWrapper = ({
  children,
}: React.PropsWithChildren) => {
  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  if (!isDefined(fieldMetadataItemUsedInDropdown)) {
    return null;
  }
  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.ExtraLarge}>
      {children}
    </DropdownContent>
  );
};
