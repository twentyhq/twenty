import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { type Agenda } from '../shared/types';

export const WorkspaceIcon = ({
  workspace,
}: {
  workspace: Agenda['workspace'] | null;
}) => (
  <span aria-hidden="true" className="workspace-avatar">
    <Avatar
      avatarUrl={workspace?.logoUrl || './twenty.svg'}
      placeholder={workspace?.name ?? 'Twenty'}
      size="lg"
      type="squared"
    />
  </span>
);
