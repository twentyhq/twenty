import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { IconChevronLeft } from '@/ui/display/icon/index';
import { navigationMemorizedUrlState } from '@/ui/navigation/states/navigationMemorizedUrlState';

type NavigationDrawerBackButtonProps = {
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

export const NavigationDrawerBackButton = ({
  title,
}: NavigationDrawerBackButtonProps) => {
  const navigate = useNavigate();
  const navigationMemorizedUrl = useRecoilValue(navigationMemorizedUrlState);

  return (
    <StyledContainer>
      <StyledIconAndButtonContainer
        onClick={() => {
          navigate(navigationMemorizedUrl, { replace: true });
        }}
      >
        <IconChevronLeft />
        <span>{title}</span>
      </StyledIconAndButtonContainer>
    </StyledContainer>
  );
};
