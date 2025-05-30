import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useRemoveRecordFilter } from '@/object-record/record-filter/hooks/useRemoveRecordFilter';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useDropdown } from '@/ui/layout/dropdown/hooks/useDropdown';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useLingui } from '@lingui/react/macro';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';

export const ObjectFilterDropdownSearchInput = () => {
  const { t } = useLingui();
  const { closeDropdown } = useDropdown(VIEW_BAR_FILTER_DROPDOWN_ID);
  const [searchValue, setSearchValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
  );
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { removeRecordFilter } = useRemoveRecordFilter();
  const { objectNamePlural = '' } = useParams();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const searchVectorField = objectMetadataItem.fields.find(
    (field) => field.type === 'TS_VECTOR' && field.name === 'searchVector',
  );

  useEffect(() => {
    if (!searchVectorField) {
      return;
    }

    if (!searchValue) {
      removeRecordFilter({
        recordFilterId: `search-${searchVectorField.id}`,
      });
      return;
    }
    upsertRecordFilter({
      id: `search-${searchVectorField.id}`,
      fieldMetadataId: searchVectorField.id,
      value: searchValue,
      displayValue: searchValue,
      type: 'TEXT',
      operand: ViewFilterOperand.Search,
      label: 'Search',
    });
  }, [searchValue, searchVectorField, upsertRecordFilter, removeRecordFilter]);

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchValue}
        placeholder={t`Search`}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') {
            closeDropdown();
          }
        }}
      />
    </DropdownContent>
  );
};
