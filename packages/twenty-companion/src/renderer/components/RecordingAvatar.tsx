import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { type Recording } from '../../shared/types/Recording';

export const RecordingAvatar = ({ recording }: { recording: Recording }) => {
  const participant = recording.participants?.[0];
  return (
    <span aria-hidden="true">
      <Avatar
        src={participant?.avatarUrl}
        name={participant?.name ?? '?'}
        colorSeed={participant?.id}
        size="lg"
        shape="square"
      />
    </span>
  );
};
