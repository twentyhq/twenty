import { isUndefined } from '@sniptt/guards';
import { Tag } from 'twenty-ui/data-display';
import { IconClock } from 'twenty-ui/icon';

import { CallRecordingRowMetadata } from 'src/front-components/components/CallRecordingRowMetadata';
import { type CallRecordingStatusTag } from 'src/front-components/types/call-recording-status-tag.type';

type CallRecordingRowStatusProps = {
  statusTag: CallRecordingStatusTag | undefined;
  formattedDuration: string | undefined;
};

export const CallRecordingRowStatus = ({
  statusTag,
  formattedDuration,
}: CallRecordingRowStatusProps) => {
  if (!isUndefined(statusTag)) {
    return <Tag color={statusTag.color} text={statusTag.text} />;
  }

  if (isUndefined(formattedDuration)) {
    return null;
  }

  return <CallRecordingRowMetadata Icon={IconClock} text={formattedDuration} />;
};
