import { Avatar } from 'twenty-ui/primitives/data-display';
import { getWorkspaceAvatarColorSeed, isDefined } from 'twenty-ui/utilities';
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
      colorSeed={
        isDefined(workspace)
          ? getWorkspaceAvatarColorSeed(workspace.name)
          : undefined
      }
      size="lg"
      shape="square"
    />
  </span>
);
