import { Avatar } from 'twenty-ui/primitives/data-display';
import { getAvatarInitial } from 'twenty-ui/utilities';
import { type Agenda } from '../../shared/types/Agenda';

export const WorkspaceIcon = ({
  workspace,
}: {
  workspace: Agenda['workspace'] | null;
}) => {
  const workspaceName = workspace?.name ?? 'Twenty';

  return (
    <span aria-hidden="true" className="workspace-avatar">
      <Avatar
        src={workspace?.logoUrl || './twenty.svg'}
        name={workspaceName}
        colorSeed={getAvatarInitial(workspaceName)}
        size="lg"
        shape="square"
      />
    </span>
  );
};
