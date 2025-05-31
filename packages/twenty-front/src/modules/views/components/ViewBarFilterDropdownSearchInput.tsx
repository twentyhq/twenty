import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { getFilterTypeFromFieldType } from '@/object-metadata/utils/formatFieldMetadataItemsAsFilterDefinitions';
import { objectFilterDropdownSearchInputComponentState } from '@/object-record/object-filter-dropdown/states/objectFilterDropdownSearchInputComponentState';
import { useUpsertRecordFilter } from '@/object-record/record-filter/hooks/useUpsertRecordFilter';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuSearchInput } from '@/ui/layout/dropdown/components/DropdownMenuSearchInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { VIEW_BAR_FILTER_DROPDOWN_ID } from '@/views/constants/ViewBarFilterDropdownId';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useLingui } from '@lingui/react/macro';
import { useParams } from 'react-router-dom';

export const ViewBarFilterDropdownSearchInput = ({
  filterDropdownId,
}: {
  filterDropdownId: string;
}) => {
  const { t } = useLingui();
  const [searchValue, setSearchValue] = useRecoilComponentStateV2(
    objectFilterDropdownSearchInputComponentState,
    filterDropdownId || VIEW_BAR_FILTER_DROPDOWN_ID,
  );
  const { upsertRecordFilter } = useUpsertRecordFilter();
  const { objectNamePlural = '' } = useParams();

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const searchVectorField = objectMetadataItem.fields.find(
    (field) => field.type === 'TS_VECTOR' && field.name === 'searchVector',
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;

    setSearchValue(inputValue);
    if (!searchVectorField) {
      return;
    }
    const searchRecordFilter = {
      id: searchVectorField.id,
      fieldMetadataId: searchVectorField.id,
      value: inputValue,
      displayValue: inputValue,
      operand: ViewFilterOperand.Search,
      type: getFilterTypeFromFieldType(searchVectorField.type),
      label: 'Search',
    };

    upsertRecordFilter(searchRecordFilter);
  };

  return (
    <DropdownContent widthInPixels={GenericDropdownContentWidth.Medium}>
      <DropdownMenuSearchInput
        autoFocus
        type="text"
        value={searchValue}
        placeholder={t`Search`}
        onChange={handleSearchChange}
      />
    </DropdownContent>
  );
};
