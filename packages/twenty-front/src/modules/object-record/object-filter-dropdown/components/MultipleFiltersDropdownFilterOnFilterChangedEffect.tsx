import { useEffect } from 'react';

import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { fieldMetadataItemUsedInDropdownComponentSelector } from '@/object-record/object-filter-dropdown/states/fieldMetadataItemUsedInDropdownComponentSelector';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { isDefined } from 'twenty-shared';

export const MultipleFiltersDropdownFilterOnFilterChangedEffect = () => {
  const { setDropdownWidth } = useDropdown();

  const fieldMetadataItemUsedInDropdown = useRecoilComponentValueV2(
    fieldMetadataItemUsedInDropdownComponentSelector,
  );

  useEffect(() => {
    if (!isDefined(fieldMetadataItemUsedInDropdown)) {
      return;
    }

    const filterType = getFilterTypeFromFieldType(
      fieldMetadataItemUsedInDropdown.type,
    );

    switch (filterType) {
      case 'DATE':
      case 'DATE_TIME':
        setDropdownWidth(280);
        break;
      default:
        setDropdownWidth(200);
    }
  }, [fieldMetadataItemUsedInDropdown, setDropdownWidth]);

  return null;
};
