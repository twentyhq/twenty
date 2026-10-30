import { Tag as StatusChip } from 'twenty-ui/primitives/data-display';
import { recordingLabel } from '../utils/recordingLabel';

export const Status = ({ status }: { status: string }) => (
  <StatusChip
    color={
      status.toUpperCase() === 'FAILED'
        ? 'red'
        : status.toUpperCase() === 'PROCESSING'
          ? 'blue'
          : 'gray'
    }
  >
    {recordingLabel(status)}
  </StatusChip>
);
