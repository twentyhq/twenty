import { MemoryRouter } from 'react-router-dom';
import RequireAuth from '../RequireAuth';

const component = {
  title: 'RequireAuth',
  component: RequireAuth,
};

export default component;

export const RequireAuthWithHelloChild = () => (
  <MemoryRouter>
    <RequireAuth>
      <div>Hello</div>
    </RequireAuth>
  </MemoryRouter>
);
