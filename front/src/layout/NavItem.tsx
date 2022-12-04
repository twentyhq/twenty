import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
};

type StyledItemProps = {
  active?: boolean;
};

const StyledItem = styled.button`
  display: flex;
  height: 60px;
  background: inherit;
  align-items: center;
  padding-left: 10px;
  padding-right: 10px;
  margin-left: 10px;
  margin-right: 10px;
  font-size: 16px;
  margin-bottom: -2px;
  cursor: pointer;
  color: ${(props: StyledItemProps) => (props.active ? 'black' : '#2e3138')};
  font-weight: ${(props: StyledItemProps) =>
    props.active ? 'bold' : 'inherit'};
  border: 0;
  border-bottom: ${(props: StyledItemProps) =>
    props.active ? '2px solid black' : '2px solid #eaecee'};
  &:hover {
    border-bottom: 2px solid #2e3138;
  }
`;

function NavItem({ label, to, active }: OwnProps) {
  const navigate = useNavigate();

  return (
    <StyledItem
      onClick={() => {
        navigate(to);
      }}
      active={active}
      aria-selected={active}
    >
      {label}
    </StyledItem>
  );
}

export default NavItem;
