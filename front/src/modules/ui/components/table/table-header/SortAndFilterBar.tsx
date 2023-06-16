import styled from '@emotion/styled';

import {
  FilterableFieldsType,
  SelectedFilterType,
} from '@/filters-and-sorts/interfaces/filters/interface';
import { SelectedSortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import { IconArrowNarrowDown, IconArrowNarrowUp } from '@/ui/icons/index';

import SortOrFilterChip from './SortOrFilterChip';

type OwnProps<SortField, TData extends FilterableFieldsType> = {
  sorts: Array<SelectedSortType<SortField>>;
  onRemoveSort: (sortId: SelectedSortType<SortField>['key']) => void;
  filters: Array<SelectedFilterType<TData>>;
  onRemoveFilter: (filterId: SelectedFilterType<TData>['key']) => void;
  onCancelClick: () => void;
};

const StyledBar = styled.div`
  align-items: center;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  display: flex;
  flex-direction: row;
  height: 40px;
  justify-content: space-between;
`;

const StyledChipcontainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
  gap: ${(props) => props.theme.spacing(1)};
  height: 40px;
  justify-content: space-between;
  margin-left: ${(props) => props.theme.spacing(2)};
  overflow-x: auto;
`;

const StyledCancelButton = styled.button`
  background-color: inherit;
  border: none;
  color: ${(props) => props.theme.text60};
  cursor: pointer;
  font-weight: 500;
  margin-left: auto;
  margin-right: ${(props) => props.theme.spacing(2)};
  padding: ${(props) => {
    const horiz = props.theme.spacing(2);
    const vert = props.theme.spacing(1);
    return `${vert} ${horiz} ${vert} ${horiz}`;
  }};
  user-select: none;

  &:hover {
    background-color: ${(props) => props.theme.tertiaryBackground};
    border-radius: ${(props) => props.theme.spacing(1)};
  }
`;

function SortAndFilterBar<SortField, TData extends FilterableFieldsType>({
  sorts,
  onRemoveSort,
  filters,
  onRemoveFilter,
  onCancelClick,
}: OwnProps<SortField, TData>) {
  return (
    <StyledBar>
      <StyledChipcontainer>
        {sorts.map((sort) => {
          return (
            <SortOrFilterChip
              key={sort.key}
              labelValue={sort.label}
              id={sort.key}
              icon={
                sort.order === 'desc' ? (
                  <IconArrowNarrowDown size={16} />
                ) : (
                  <IconArrowNarrowUp size={16} />
                )
              }
              onRemove={() => onRemoveSort(sort.key)}
            />
          );
        })}
        {filters.map((filter) => {
          return (
            <SortOrFilterChip
              key={filter.key}
              labelKey={filter.label}
              labelValue={`${filter.operand.label} ${filter.displayValue}`}
              id={filter.key}
              icon={filter.icon}
              onRemove={() => onRemoveFilter(filter.key)}
            />
          );
        })}
      </StyledChipcontainer>
      {filters.length + sorts.length > 0 && (
        <StyledCancelButton
          data-testid={'cancel-button'}
          onClick={onCancelClick}
        >
          Cancel
        </StyledCancelButton>
      )}
    </StyledBar>
  );
}

export default SortAndFilterBar;
