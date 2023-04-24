import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownButton from './DropdownButton';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import SortAndFilterBar, { SortType } from './SortAndFilterBar';
import { useCallback, useState } from 'react';

type OwnProps = {
  viewName: string;
  viewIcon?: IconProp;
  onSortsUpdate?: (sorts: Array<SortType>) => void;
  sortsAvailable: Array<SortType>;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledTableHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  color: ${(props) => props.theme.text60};
  font-weight: 500;
  padding-left: ${(props) => props.theme.spacing(3)};
  padding-right: ${(props) => props.theme.spacing(1)};
`;

const StyledIcon = styled.div`
  display: flex;
  margin-right: ${(props) => props.theme.spacing(2)};
`;

const StyledViewSection = styled.div`
  display: flex;
`;

const StyledFilters = styled.div`
  display: flex;
  font-weight: 400;
  margin-right: ${(props) => props.theme.spacing(2)};
`;

function TableHeader({
  viewName,
  viewIcon,
  onSortsUpdate,
  sortsAvailable,
}: OwnProps) {
  const [sorts, setSorts] = useState([] as Array<SortType>);

  const onSortItemSelect = useCallback(
    (sortId: string) => {
      const newSorts = [
        {
          label: 'Created at',
          order: 'asc',
          id: sortId,
        } satisfies SortType,
      ];
      setSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate],
  );

  const onSortItemUnSelect = useCallback(
    (sortId: string) => {
      const newSorts = [] as SortType[];
      setSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate],
  );

  return (
    <StyledContainer>
      <StyledTableHeader>
        <StyledViewSection>
          <StyledIcon>
            {viewIcon && <FontAwesomeIcon icon={viewIcon} size="lg" />}
          </StyledIcon>
          {viewName}
        </StyledViewSection>
        <StyledFilters>
          <DropdownButton label="Filter" options={[]} isActive={false} />
          <DropdownButton
            label="Sort"
            options={sortsAvailable}
            onSortSelect={onSortItemSelect}
            isActive={sorts.length > 0}
          />
          <DropdownButton label="Settings" options={[]} isActive={false} />
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length > 0 && (
        <SortAndFilterBar sorts={sorts} onRemoveSort={onSortItemUnSelect} />
      )}
    </StyledContainer>
  );
}

export default TableHeader;
