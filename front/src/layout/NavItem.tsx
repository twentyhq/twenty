import { css, cx } from '@linaria/core';
import { useNavigate } from 'react-router-dom';

type OwnProps = {
  label: string;
  to: string;
  active?: boolean;
};

const nav = css`
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
  color: #2e3138;
  border: 0;
  border-bottom: 2px solid #eaecee;
  &:hover {
    border-bottom: 2px solid #2e3138;
  }
`;

const navActive = css`
  border-bottom: 2px solid black;
  font-weight: bold;
  color: black;
`;

function NavItem({ label, to, active }: OwnProps) {
  const navigate = useNavigate();

  return (
    <button
      className={cx(nav, active && navActive)}
      onClick={() => {
        navigate(to);
      }}
      aria-selected={active}
    >
      {label}
    </button>
  );
}

export default NavItem;
