import styled from '@emotion/styled';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import SortOrFilterChip from './SortOrFilterChip';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-regular-svg-icons';

type OwnProps = {
  sorts: Array<SelectedSortType>;
  onRemoveSort: (sortId: string) => void;
};

export type SortType<SortIds = string> = {
  label: string;
  id: SortIds;
  icon?: IconProp;
};

export type SelectedSortType = SortType & { order: 'asc' | 'desc' };

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

function SortAndFilterBar({ sorts, onRemoveSort }: OwnProps) {
  return (
    <StyledBar>
      {sorts.map((sort) => {
        return (
          <SortOrFilterChip
            key={sort.id}
            label={sort.label}
            id={sort.id}
            icon={sort.order === 'asc' ? faArrowDown : faArrowUp}
            onRemove={() => onRemoveSort(sort.id)}
          />
        );
      })}
      {sorts.length > 0 && (
        <StyledCancelButton
          data-testid={'cancel-button'}
          onClick={() => sorts.forEach((i) => onRemoveSort(i.id))}
        >
          Cancel
        </StyledCancelButton>
      )}
    </StyledBar>
  );
}

export default SortAndFilterBar;
