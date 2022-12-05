import { MemoryRouter } from 'react-router-dom';
import Inbox from '../../../pages/inbox/Inbox';

export default {
  title: 'Inbox',
  component: Inbox,
};

export const InboxDefault = () => (
  <MemoryRouter>
    <Inbox />
  </MemoryRouter>
);
