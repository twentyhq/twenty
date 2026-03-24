import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowsSort, IconTrash } from 'twenty-ui/display';
import { Button, type SelectOption } from 'twenty-ui/input';
import { Select } from '@/ui/input/components/Select';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { v4 as uuidv4 } from 'uuid';
import { ViewSortDirection } from '~/generated-metadata/graphql';

const StyledSortItemContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAddButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};
`;

type RecordTableSettingsSortsContentProps = {
  sortableFieldOptions: Array<SelectOption<string>>;
  directionOptions: Array<SelectOption<ViewSortDirection>>;
};

export const RecordTableSettingsSortsContent = ({
  sortableFieldOptions,
  directionOptions,
}: RecordTableSettingsSortsContentProps) => {
  const [currentRecordSorts, setCurrentRecordSorts] = useAtomComponentState(
    currentRecordSortsComponentState,
  );

  const handleAddSort = () => {
    const firstAvailableField = sortableFieldOptions[0]?.value;

    if (!isDefined(firstAvailableField)) {
      return;
    }

    const newSort: RecordSort = {
      id: uuidv4(),
      fieldMetadataId: firstAvailableField,
      direction: ViewSortDirection.ASC,
    };

    setCurrentRecordSorts([...currentRecordSorts, newSort]);
  };

  const handleRemoveSort = (sortId: string) => {
    setCurrentRecordSorts(
      currentRecordSorts.filter((sort) => sort.id !== sortId),
    );
  };

  const handleFieldChange = (sortId: string, fieldMetadataId: string) => {
    setCurrentRecordSorts(
      currentRecordSorts.map((sort) =>
        sort.id === sortId ? { ...sort, fieldMetadataId } : sort,
      ),
    );
  };

  const handleDirectionChange = (
    sortId: string,
    direction: ViewSortDirection,
  ) => {
    setCurrentRecordSorts(
      currentRecordSorts.map((sort) =>
        sort.id === sortId ? { ...sort, direction } : sort,
      ),
    );
  };

  return (
    <>
      {currentRecordSorts.map((sort) => (
        <StyledSortItemContainer key={sort.id}>
          <Select
            dropdownId={`record-table-widget-sort-field-${sort.id}`}
            fullWidth
            value={sort.fieldMetadataId}
            options={sortableFieldOptions}
            onChange={(value) => handleFieldChange(sort.id, value)}
            withSearchInput
          />
          <Select
            dropdownId={`record-table-widget-sort-direction-${sort.id}`}
            fullWidth
            value={sort.direction}
            options={directionOptions}
            onChange={(value) =>
              handleDirectionChange(sort.id, value as ViewSortDirection)
            }
          />
          <Button onClick={() => handleRemoveSort(sort.id)} Icon={IconTrash} />
        </StyledSortItemContainer>
      ))}
      <StyledAddButtonContainer>
        <Button
          Icon={IconArrowsSort}
          size="small"
          variant="secondary"
          accent="default"
          onClick={handleAddSort}
          ariaLabel={t`Add sort`}
          title={t`Add sort`}
        />
      </StyledAddButtonContainer>
    </>
  );
};
