import styled from '@emotion/styled';
import SortOrFilterChip from './SortOrFilterChip';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import {
  FilterableFieldsType,
  SelectedFilterType,
} from '../../../interfaces/filters/interface';
import { SelectedSortType } from '../../../interfaces/sorts/interface';

type OwnProps<SortField, TData extends FilterableFieldsType> = {
  sorts: Array<SelectedSortType<SortField>>;
  onRemoveSort: (sortId: SelectedSortType<SortField>['key']) => void;
  filters: Array<SelectedFilterType<TData>>;
  onRemoveFilter: (filterId: SelectedFilterType<TData>['key']) => void;
  onCancelClick: () => void;
};

const StyledBar = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  align-items: center;
  justify-content: space-between;
  height: 40px;
`;

const StyledCancelButton = styled.button`
  margin-left: auto;
  border: none;
  background-color: inherit;
  padding: ${(props) => {
    const horiz = props.theme.spacing(2);
    const vert = props.theme.spacing(1);
    return `${vert} ${horiz} ${vert} ${horiz}`;
  }};
  color: ${(props) => props.theme.text40};
  font-weight: 500;
  margin-right: ${(props) => props.theme.spacing(2)};
  cursor: pointer;

  &:hover {
    border-radius: ${(props) => props.theme.spacing(1)};
    background-color: ${(props) => props.theme.tertiaryBackground};
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
      {sorts.map((sort) => {
        return (
          <SortOrFilterChip
            key={sort.key}
            labelValue={sort.label}
            id={sort.key}
            icon={sort.order === 'asc' ? <FaArrowDown /> : <FaArrowUp />}
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
