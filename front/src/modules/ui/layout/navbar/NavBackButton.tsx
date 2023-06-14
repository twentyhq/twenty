import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import { IconChevronLeft } from '@/ui/icons/index';

import NavCollapseButton from './NavCollapseButton';

type OwnProps = {
  title: string;
};

const IconAndButtonContainer = styled.button`
  align-items: center;
  background: inherit;
  border: none;
  color: ${(props) => props.theme.text60};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  font-size: ${(props) => props.theme.fontSizeLarge};
  font-weight: ${(props) => props.theme.fontWeightSemibold};
  gap: ${(props) => props.theme.spacing(1)};
  padding: ${(props) => props.theme.spacing(1)};
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default function NavBackButton({ title }: OwnProps) {
  const navigate = useNavigate();

  return (
    <>
      <StyledContainer>
        <IconAndButtonContainer
          onClick={() => navigate('/', { replace: true })}
        >
          <IconChevronLeft strokeWidth={3} />
          <span>{title}</span>
        </IconAndButtonContainer>
        <NavCollapseButton hideOnDesktop={true} />
      </StyledContainer>
    </>
  );
}
