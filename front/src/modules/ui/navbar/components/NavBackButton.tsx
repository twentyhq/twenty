import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { IconChevronLeft } from '@/ui/icon/index';
import { isNavbarSwitchingSizeState } from '@/ui/layout/states/isNavbarSwitchingSizeState';

type OwnProps = {
  title: string;
};

const StyledIconAndButtonContainer = styled.button`
  align-items: center;
  background: inherit;
  border: none;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  gap: ${({ theme }) => theme.spacing(1)};
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

const NavBackButton = ({ title }: OwnProps) => {
  const navigate = useNavigate();
  const [, setIsNavbarSwitchingSize] = useRecoilState(
    isNavbarSwitchingSizeState,
  );

  return (
    <>
      <StyledContainer>
        <StyledIconAndButtonContainer
          onClick={() => {
            setIsNavbarSwitchingSize(true);
            navigate('/', { replace: true });
          }}
        >
          <IconChevronLeft />
          <span>{title}</span>
        </StyledIconAndButtonContainer>
      </StyledContainer>
    </>
  );
};

export default NavBackButton;
