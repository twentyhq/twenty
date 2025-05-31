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
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';

export const ViewBarFilterDropdownSearchInput = ({
  filterDropdownId,
}: {
  filterDropdownId: string;
}) => {
  const { t } = useLingui();
  const { closeDropdown, isDropdownOpen } = useDropdown(filterDropdownId);
  const [searchValue, setSearchValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    filterDropdownId || VIEW_BAR_FILTER_DROPDOWN_ID,
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

  const handleDropdownClose = useCallback(() => {
    if (!searchValue && isDefined(searchVectorField)) {
      removeRecordFilter({
        recordFilterId: `search-${searchVectorField.id}`,
      });
    }
  }, [searchValue, searchVectorField, removeRecordFilter]);

  useEffect(() => {
    if (!searchVectorField) {
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
  }, [searchValue, searchVectorField, upsertRecordFilter]);

  useEffect(() => {
    if (!isDropdownOpen) {
      handleDropdownClose();
    }
  }, [isDropdownOpen, handleDropdownClose]);

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchValue}
        placeholder={t`Search`}
        onChange={(e) => setSearchValue(e.target.value)}
        onKeyDown={(e) => {
          const shouldCloseDropdown =
            e.key === 'Escape' && filterDropdownId !== undefined;
          if (shouldCloseDropdown) {
            closeDropdown();
          }
        }}
      />
    </DropdownContent>
  );
};
