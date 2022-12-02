import Navbar from './Navbar';
import { css } from '@linaria/core';

const layout = css`
  display: flex;
  flex-direction: column;
`;

type OwnProps = {
  children: JSX.Element;
};

function AppLayout({ children }: OwnProps) {
  return (
    <div className={layout}>
      <Navbar />
      <div>{children}</div>
    </div>
  );
}

export default AppLayout;
