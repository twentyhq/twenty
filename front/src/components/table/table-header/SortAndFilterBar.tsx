import styled from '@emotion/styled';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import SortOrFilterChip from './SortOrFilterChip';
import { faArrowDown, faArrowUp } from '@fortawesome/pro-regular-svg-icons';

type OwnProps = {
  sorts: Array<SortType>;
  onRemoveSort: (sortId: string) => void;
};

export type SortType = {
  label: string;
  order: string;
  id: string;
  icon?: IconProp;
};

const StyledBar = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 1px solid ${(props) => props.theme.primaryBorder};
  align-items: center;
  justify-content: space-between;
  height: 40px;
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
    </StyledBar>
  );
}

export default SortAndFilterBar;
