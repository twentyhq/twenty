import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { type RecordSort } from '@/object-record/record-sort/types/RecordSort';
import { Select } from '@/ui/input/components/Select';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconArrowsSort, IconTrash, useIcons } from 'twenty-ui/display';
import { Button, type SelectOption } from 'twenty-ui/input';
import { v4 as uuidv4 } from 'uuid';
import { ViewSortDirection } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledSortItemContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledAddButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(1)};
`;

type WorkflowFindRecordsSortsProps = {
  recordSorts: RecordSort[];
  onChange: (recordSorts: RecordSort[]) => void;
  objectMetadataItem: ObjectMetadataItem;
  readonly: boolean;
};

export const WorkflowFindRecordsSorts = ({
  recordSorts,
  onChange,
  objectMetadataItem,
  readonly,
}: WorkflowFindRecordsSortsProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();

  const sortableFields = objectMetadataItem.fields
    .filter(filterSortableFieldMetadataItems)
    .map((field) => ({
      Icon: getIcon(field.icon),
      label: field.label,
      value: field.id,
    }));

  const directionOptions: Array<SelectOption<ViewSortDirection>> = [
    {
      label: t`Ascending`,
      value: ViewSortDirection.ASC,
    },
    {
      label: t`Descending`,
      value: ViewSortDirection.DESC,
    },
  ];

  const handleAddSort = () => {
    if (readonly) {
      return;
    }

    const newSort: RecordSort = {
      id: uuidv4(),
      fieldMetadataId: sortableFields[0]?.value ?? '',
      direction: ViewSortDirection.ASC,
    };

    onChange([...recordSorts, newSort]);
  };

  const handleRemoveSort = (sortId: string) => {
    if (readonly) {
      return;
    }

    onChange(recordSorts.filter((sort) => sort.id !== sortId));
  };

  const handleFieldChange = (sortId: string, fieldMetadataId: string) => {
    if (readonly) {
      return;
    }

    onChange(
      recordSorts.map((sort) =>
        sort.id === sortId ? { ...sort, fieldMetadataId } : sort,
      ),
    );
  };

  const handleDirectionChange = (
    sortId: string,
    direction: ViewSortDirection,
  ) => {
    if (readonly) {
      return;
    }

    onChange(
      recordSorts.map((sort) =>
        sort.id === sortId ? { ...sort, direction } : sort,
      ),
    );
  };

  return (
    <StyledContainer>
      {recordSorts.map((sort) => {
        return (
          <StyledSortItemContainer key={sort.id}>
            <Select
              dropdownId={`workflow-find-records-sort-field-${sort.id}`}
              fullWidth
              disabled={readonly}
              value={sort.fieldMetadataId}
              options={sortableFields}
              onChange={(value) => handleFieldChange(sort.id, value)}
              withSearchInput
            />

            <Select
              dropdownId={`workflow-find-records-sort-direction-${sort.id}`}
              fullWidth
              disabled={readonly}
              value={sort.direction}
              options={directionOptions}
              onChange={(value) =>
                handleDirectionChange(sort.id, value as ViewSortDirection)
              }
            />

            {!readonly && (
              <Button
                onClick={() => handleRemoveSort(sort.id)}
                Icon={IconTrash}
                disabled={readonly}
              />
            )}
          </StyledSortItemContainer>
        );
      })}

      <StyledAddButtonContainer>
        <Button
          Icon={IconArrowsSort}
          size="small"
          variant="secondary"
          accent="default"
          onClick={handleAddSort}
          ariaLabel={t`Add sort`}
          title={t`Add sort`}
          disabled={readonly}
        />
      </StyledAddButtonContainer>
    </StyledContainer>
  );
};
