import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { filterSortableFieldMetadataItems } from '@/object-metadata/utils/filterSortableFieldMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { type WorkflowRecordSort } from '@/workflow/types/Workflow';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ViewSortDirection } from 'twenty-shared/types';
import { IconArrowsSort, IconTrash } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSortItemContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledAddButtonContainer = styled.div`
  margin-top: ${themeCssVariables.spacing[1]};
`;

type WorkflowFindRecordsSortsProps = {
  recordSorts: WorkflowRecordSort[];
  onChange: (recordSorts: WorkflowRecordSort[]) => void;
  objectMetadataItem: EnrichedObjectMetadataItem;
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

    const newSort: WorkflowRecordSort = {
      fieldMetadataId: sortableFields[0]?.value ?? '',
      direction: ViewSortDirection.ASC,
    };

    onChange([...recordSorts, newSort]);
  };

  const handleRemoveSort = (sortIndex: number) => {
    if (readonly) {
      return;
    }

    onChange(recordSorts.filter((_sort, index) => index !== sortIndex));
  };

  const handleFieldChange = ({
    sortIndex,
    fieldMetadataId,
  }: {
    sortIndex: number;
    fieldMetadataId: string;
  }) => {
    if (readonly) {
      return;
    }

    onChange(
      recordSorts.map((sort, index) =>
        index === sortIndex ? { ...sort, fieldMetadataId } : sort,
      ),
    );
  };

  const handleDirectionChange = ({
    sortIndex,
    direction,
  }: {
    sortIndex: number;
    direction: ViewSortDirection;
  }) => {
    if (readonly) {
      return;
    }

    onChange(
      recordSorts.map((sort, index) =>
        index === sortIndex ? { ...sort, direction } : sort,
      ),
    );
  };

  return (
    <StyledContainer>
      {recordSorts.map((sort, index) => {
        return (
          <StyledSortItemContainer key={index}>
            <Select
              dropdownId={`workflow-find-records-sort-field-${index}`}
              fullWidth
              disabled={readonly}
              value={sort.fieldMetadataId}
              options={sortableFields}
              onChange={(fieldMetadataId) =>
                handleFieldChange({ sortIndex: index, fieldMetadataId })
              }
              withSearchInput
            />

            <Select
              dropdownId={`workflow-find-records-sort-direction-${index}`}
              fullWidth
              disabled={readonly}
              value={sort.direction}
              options={directionOptions}
              onChange={(direction) =>
                handleDirectionChange({ sortIndex: index, direction })
              }
            />

            {!readonly && (
              <Button
                onClick={() => handleRemoveSort(index)}
                startIcon={<IconTrash />}
                aria-label={t`Delete`}
                disabled={readonly}
              />
            )}
          </StyledSortItemContainer>
        );
      })}

      <StyledAddButtonContainer>
        <Button
          startIcon={<IconArrowsSort />}
          size="sm"
          onClick={handleAddSort}
          aria-label={t`Add sort`}
          disabled={readonly}
          variant="outline"
        >{t`Add sort`}</Button>
      </StyledAddButtonContainer>
    </StyledContainer>
  );
};
