import { TbChevronLeft } from 'react-icons/tb';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';

type OwnProps = {
  title: string;
};

const StyledContainer = styled.button`
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
`;

export default function NavBackButton({ title }: OwnProps) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <StyledContainer
      onClick={() => navigate(location.state?.from || '/', { replace: true })}
    >
      <TbChevronLeft strokeWidth={3} />
      <span>{title}</span>
    </StyledContainer>
  );
}
