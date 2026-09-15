import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { H1Title, H1TitleFontColor } from '@ui/typography/H1Title/H1Title';
import { Card } from '@ui/surfaces/Card/Card';
import { i18n } from '@lingui/core';
import { Button } from '@ui/input/Button/Button';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
} from 'twenty-ui/icon';
import { RecordingTimer } from './RecordingTimer';
import { type ActionProps } from '../types/ActionProps';

export const RecordingControls = ({
  state,
  isPending,
  command,
}: ActionProps) => {
  const active = state.activeRecording;
  if (!active) return null;
  const paused = active.status === 'paused';
  const transitional = !['recording', 'paused'].includes(active.status);
  const label = {
    starting: i18n._('Starting recording…'),
    recording: i18n._('Recording'),
    pausing: i18n._('Pausing…'),
    paused: i18n._('Recording paused'),
    resuming: i18n._('Resuming…'),
    stopping: i18n._('Finishing recording…'),
  }[active.status];
  return (
    <Card
      className="live-card"
      aria-label={i18n._('Current recording')}
      backgroundColor="var(--t-background-secondary)"
    >
      <div className="live-heading">
        <Avatar
          name={active.title}
          colorSeed={active.id}
          size="xl"
          shape="rounded-square"
        />
        <div className="grow">
          <H1Title
            className="live-title"
            title={active.title}
            fontColor={H1TitleFontColor.Primary}
          />
          <span className="small muted" role="status">
            {label} · <RecordingTimer recording={active} />
          </span>
        </div>
      </div>
      <div className="live-actions">
        <Button
          disabled={
            isPending('pause', 'resume', 'stop', 'record') || transitional
          }
          onClick={() => void command({ type: paused ? 'resume' : 'pause' })}
          variant="secondary"
          size="medium"
          Icon={paused ? IconPlayerPlay : IconPlayerPause}
          title={paused ? i18n._('Resume') : i18n._('Pause')}
        />
        <Button
          disabled={
            isPending('pause', 'resume', 'stop', 'record') || transitional
          }
          onClick={() => void command({ type: 'stop' })}
          variant="secondary"
          accent="danger"
          size="medium"
          Icon={IconPlayerStop}
          title={i18n._('Finish recording')}
        />
      </div>
    </Card>
  );
};
