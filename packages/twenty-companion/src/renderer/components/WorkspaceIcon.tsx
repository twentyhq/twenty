import { Avatar } from 'twenty-ui/primitives/data-display';
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
