import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { type Recording } from '../shared/types';

export const RecordingAvatar = ({ recording }: { recording: Recording }) => {
  const participant = recording.participants?.[0];
  return (
    <span aria-hidden="true">
      <Avatar
        avatarUrl={participant?.avatarUrl}
        placeholder={participant?.name ?? '?'}
        placeholderColorSeed={participant?.id}
        size="lg"
        type="squared"
      />
    </span>
  );
};
