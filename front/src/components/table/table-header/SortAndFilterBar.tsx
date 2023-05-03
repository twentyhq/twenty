import styled from '@emotion/styled';
import SortOrFilterChip from './SortOrFilterChip';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-regular-svg-icons';
import { SelectedFilterType, SelectedSortType } from './interface';

type OwnProps<SortField> = {
  sorts: Array<SelectedSortType<SortField>>;
  onRemoveSort: (sortId: SelectedSortType<SortField>['key']) => void;
  filters: Array<SelectedFilterType>;
  onRemoveFilter: (filterId: SelectedFilterType['key']) => void;
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

function SortAndFilterBar<SortField extends string>({
  sorts,
  onRemoveSort,
  filters,
  onRemoveFilter,
}: OwnProps<SortField>) {
  return (
    <StyledBar>
      {sorts.map((sort) => {
        return (
          <SortOrFilterChip
            key={sort.key}
            labelValue={sort.label}
            id={sort.key}
            icon={sort.order === 'asc' ? faArrowDown : faArrowUp}
            onRemove={() => onRemoveSort(sort.key)}
          />
        );
      })}
      {filters.map((filter) => {
        return (
          <SortOrFilterChip
            key={filter.key}
            labelKey={filter.label}
            labelValue={`${filter.operand.label} ${filter.value}`}
            id={filter.key}
            icon={filter.icon}
            onRemove={() => onRemoveFilter(filter.key)}
          />
        );
      })}
      {filters.length + sorts.length > 0 && (
        <StyledCancelButton
          data-testid={'cancel-button'}
          onClick={() => {
            sorts.forEach((i) => onRemoveSort(i.key));
            filters.forEach((i) => onRemoveFilter(i.key));
          }}
        >
          Cancel
        </StyledCancelButton>
      )}
    </StyledBar>
  );
}

export default SortAndFilterBar;
