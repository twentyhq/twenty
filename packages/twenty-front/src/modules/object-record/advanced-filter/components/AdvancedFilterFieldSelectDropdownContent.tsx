import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterCompositeSubFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterCompositeSubFieldSelectMenu';
import { AdvancedFilterFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterFieldSelectMenu';
import { AdvancedFilterRelationTargetFieldSelectMenu } from '@/object-record/advanced-filter/components/AdvancedFilterRelationTargetFieldSelectMenu';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';

type AdvancedFilterFieldSelectDropdownContentProps = {
  recordFilterId: string;
};

export const AdvancedFilterFieldSelectDropdownContent = ({
  recordFilterId,
}: AdvancedFilterFieldSelectDropdownContentProps) => {
  const [searchInput, setSearchInput] = useState('');
  const [subPageFieldMetadataItem, setSubPageFieldMetadataItem] =
    useState<FieldMetadataItem | null>(null);

  return (
    <>
      <Dropdown.Page id="root">
        <AdvancedFilterFieldSelectMenu
          recordFilterId={recordFilterId}
          searchInput={searchInput}
          onSearchInputChange={setSearchInput}
          onSubPageFieldMetadataItemSelect={setSubPageFieldMetadataItem}
        />
      </Dropdown.Page>
      <Dropdown.Page id="composite">
        {isDefined(subPageFieldMetadataItem) && (
          <AdvancedFilterCompositeSubFieldSelectMenu
            recordFilterId={recordFilterId}
            fieldMetadataItem={subPageFieldMetadataItem}
          />
        )}
      </Dropdown.Page>
      <Dropdown.Page id="relation-target">
        {isDefined(subPageFieldMetadataItem) && (
          <AdvancedFilterRelationTargetFieldSelectMenu
            recordFilterId={recordFilterId}
            sourceFieldMetadataItem={subPageFieldMetadataItem}
          />
        )}
      </Dropdown.Page>
    </>
  );
};
