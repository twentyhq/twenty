import { CoreObjectNameCell } from '@/object-core/components/cells/CoreObjectNameCell';

type CoreWorkflowNameCellProps = {
  name: string | null | undefined;
  workflowId: string;
};

export const CoreWorkflowNameCell = ({
  name,
  workflowId,
}: CoreWorkflowNameCellProps) => (
  <CoreObjectNameCell
    name={name}
    avatarColorSeed={workflowId}
    avatarShape="circle"
  />
);
