import { ObjectFilterDropdownOperandButton } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandButton';
import { ObjectFilterDropdownOperandSelect } from '@/object-record/object-filter-dropdown/components/ObjectFilterDropdownOperandSelect';
import { useFilterDropdown } from '@/object-record/object-filter-dropdown/hooks/useFilterDropdown';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

const StyledOperandSelectContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  border-radius: ${({ theme }) => theme.border.radius.md};

  width: 100%;
  z-index: 1000;
`;

export const ObjectFilterDropdownFilterOperandSelect = ({
  filterDropdownId,
}: {
  filterDropdownId?: string;
}) => {
  const { isObjectFilterDropdownOperandSelectUnfoldedState } =
    useFilterDropdown({ filterDropdownId });

  const isObjectFilterDropdownOperandSelectUnfolded = useRecoilValue(
    isObjectFilterDropdownOperandSelectUnfoldedState,
  );

  return (
    <>
      <ObjectFilterDropdownOperandButton />
      {isObjectFilterDropdownOperandSelectUnfolded && (
        <StyledOperandSelectContainer>
          <ObjectFilterDropdownOperandSelect />
        </StyledOperandSelectContainer>
      )}
    </>
  );
};
