import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { type Agenda } from '../../shared/types/Agenda';

export const WorkspaceIcon = ({
  workspace,
}: {
  workspace: Agenda['workspace'] | null;
}) => (
  <span aria-hidden="true" className="workspace-avatar">
    <Avatar
      src={workspace?.logoUrl || './twenty.svg'}
      name={workspace?.name ?? 'Twenty'}
      size="lg"
      shape="square"
    />
  </span>
);
