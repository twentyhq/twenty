import { TbChevronLeft } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

import NavCollapseButton from './NavCollapseButton';

type OwnProps = {
  title: string;
};

const IconAndButtonContainer = styled.button`
  display: flex;
  flex-direction: row;
  align-items: center;
  padding: ${(props) => props.theme.spacing(1)};
  gap: ${(props) => props.theme.spacing(1)};
  font-size: ${(props) => props.theme.fontSizeLarge};
  font-weight: ${(props) => props.theme.fontWeightSemibold};
  color: ${(props) => props.theme.text60};
  border: none;
  background: inherit;
  cursor: pointer;
  width: 100%;
`;

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
`;

export default function NavBackButton({ title }: OwnProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <>
      <StyledContainer>
        <IconAndButtonContainer
          onClick={() =>
            navigate(location.state?.from || '/', { replace: true })
          }
        >
          <TbChevronLeft strokeWidth={3} />
          <span>{title}</span>
        </IconAndButtonContainer>
        <NavCollapseButton hideOnDesktop={true} />
      </StyledContainer>
    </>
  );
}
