import styled from '@emotion/styled';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import DropdownButton from './DropdownButton';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faCalendar } from '@fortawesome/pro-regular-svg-icons';
import SortAndFilterBar, { SortType } from './SortAndFilterBar';
import { useState } from 'react';

type OwnProps = {
  viewName: string;
  viewIcon?: IconProp;
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

function TableHeader({ viewName, viewIcon }: OwnProps) {
  const [sorts, setSorts] = useState([] as Array<SortType>);
  const onSortItemSelect = (sortId: string) => {
    setSorts([
      {
        label: 'Created at',
        order: 'asc',
        id: sortId,
      },
    ]);
  };

  const onSortItemUnSelect = (sortId: string) => {
    setSorts([]);
  };

  const sortsAvailable: Array<SortType> = [
    {
      id: 'created_at',
      label: 'Created at',
      order: 'asc',
      icon: faCalendar,
    },
  ];

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
          <DropdownButton label="Filter" options={[]} />
          <DropdownButton
            label="Sort"
            options={sortsAvailable}
            onSortSelect={onSortItemSelect}
          />
          <DropdownButton label="Settings" options={[]} />
        </StyledFilters>
      </StyledTableHeader>
      {sorts.length > 0 && (
        <SortAndFilterBar sorts={sorts} onRemoveSort={onSortItemUnSelect} />
      )}
    </StyledContainer>
  );
}

export default TableHeader;
