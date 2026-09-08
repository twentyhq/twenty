import { i18n } from '@lingui/core';
import { Card } from '@ui/surfaces/Card/Card';
import { THEME_COMMON } from '@ui/theme/constants/ThemeCommon';
import { IconCircleDot } from 'twenty-ui/icon';
import { type ActionProps, Empty, Status } from './components';
import { RecordingAvatar } from './RecordingAvatar';
import { formatDate } from './format';

export const RecordingList = ({ state, isPending, command }: ActionProps) => {
  const recordings = state.recordings.slice(0, 5);
  return recordings.length ? (
    <Card
      className="recording-list"
      backgroundColor="var(--t-background-secondary)"
    >
      {recordings.map((recording) => (
        <button
          className="recording-row"
          key={recording.id}
          disabled={isPending('open-recording')}
          title={i18n._('Open in Twenty')}
          onClick={() =>
            void command({ type: 'open-recording', recordingId: recording.id })
          }
        >
          <RecordingAvatar recording={recording} />
          <div className="grow">
            <strong>{recording.title}</strong>
            <span
              className="small muted"
              title={recording.participants
                ?.map((participant) => participant.name)
                .join(', ')}
            >
              {recording.participants?.[0]?.name ||
                i18n._('Unknown participant')}
              {(recording.participants?.length ?? 0) > 1 &&
                ` +${(recording.participants?.length ?? 1) - 1}`}
            </span>
          </div>
          <div className="recording-metadata">
            <span className="small muted">
              {recording.startedAt
                ? formatDate(recording.startedAt)
                : i18n._('Recent conversation')}
            </span>
            {recording.status !== 'COMPLETED' && (
              <Status status={recording.status} />
            )}
          </div>
        </button>
      ))}
    </Card>
  ) : (
    <Empty
      icon={
        <IconCircleDot
          size={THEME_COMMON.icon.size.xl}
          stroke={THEME_COMMON.icon.stroke.sm}
        />
      }
      animatedPlaceholderType="noCallRecording"
      title={i18n._('A place for every conversation')}
    >
      <p>
        {i18n._(
          'Your recorded conversations will appear here and in your Twenty workspace.',
        )}
      </p>
    </Empty>
  );
};
