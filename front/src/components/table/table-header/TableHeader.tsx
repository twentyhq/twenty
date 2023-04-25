import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownButton from './DropdownButton';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import SortAndFilterBar, {
  SelectedSortType,
  SortType,
} from './SortAndFilterBar';
import { useCallback, useState } from 'react';
import { SortDropdownButton } from './SortDropdownButton';

type OwnProps<SortFields> = {
  viewName: string;
  viewIcon?: IconProp;
  onSortsUpdate?: (sorts: Array<SelectedSortType<SortFields>>) => void;
  sortsAvailable: Array<SortType<SortFields>>;
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

  & > svg {
    font-size: ${(props) => props.theme.fontSizeLarge};
  }
`;

const StyledViewSection = styled.div`
  display: flex;
`;

const StyledFilters = styled.div`
  display: flex;
  font-weight: 400;
  margin-right: ${(props) => props.theme.spacing(2)};
`;

function TableHeader<SortFields extends string>({
  viewName,
  viewIcon,
  onSortsUpdate,
  sortsAvailable,
}: OwnProps<SortFields>) {
  const [sorts, innerSetSorts] = useState<Array<SelectedSortType<SortFields>>>(
    [],
  );

  const setSorts = useCallback(
    (sorts: SelectedSortType<SortFields>[]) => {
      innerSetSorts(sorts);
      onSortsUpdate && onSortsUpdate(sorts);
    },
    [onSortsUpdate],
  );

  const onSortItemUnSelect = useCallback(
    (sortId: string) => {
      const newSorts = [] as SelectedSortType<SortFields>[];
      innerSetSorts(newSorts);
      onSortsUpdate && onSortsUpdate(newSorts);
    },
    [onSortsUpdate],
  );

  return (
    <StyledContainer>
      <StyledTableHeader>
        <StyledViewSection>
          <StyledIcon>
            {viewIcon && <FontAwesomeIcon icon={viewIcon} />}
          </StyledIcon>
          {viewName}
        </StyledViewSection>
        <StyledFilters>
          <DropdownButton label="Filter" isActive={false}></DropdownButton>
          <SortDropdownButton
            setSorts={setSorts}
            sorts={sorts}
            sortsAvailable={sortsAvailable}
          />

          <DropdownButton label="Settings" isActive={false}></DropdownButton>
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length > 0 && (
        <SortAndFilterBar sorts={sorts} onRemoveSort={onSortItemUnSelect} />
      )}
    </StyledContainer>
  );
}

export default TableHeader;
