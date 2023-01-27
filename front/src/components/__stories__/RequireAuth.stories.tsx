import RequireAuth from '../RequireAuth';

import Navbar from '../RequireAuth';

export default {
  title: 'RequireAuth',
  component: Navbar,
};

export const RequireAuthWithHelloChild = () => (
  <RequireAuth>
    <div>Hello</div>
  </RequireAuth>
);
