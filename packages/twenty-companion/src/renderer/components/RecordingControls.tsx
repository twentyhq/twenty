import { Section } from '@ui/components/layout/Section/Section';
import { Avatar } from '@ui/primitives/data-display/Avatar/Avatar';
import { Card } from '@ui/primitives/surfaces/Card/Card';
import { i18n } from '@lingui/core';
import { Button } from '@ui/primitives/input/Button/Button';
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
        <Section.Header
          className="grow live-section-header"
          title={active.title}
          level={2}
          size="lg"
          description={
            <div className="small muted" role="status">
              {label} · <RecordingTimer recording={active} />
            </div>
          }
        />
      </div>
      <div className="live-actions">
        <Button
          disabled={
            isPending('pause', 'resume', 'stop', 'record') || transitional
          }
          onClick={() => void command({ type: paused ? 'resume' : 'pause' })}
          variant="outline"
          size="md"
          startIcon={paused ? <IconPlayerPlay /> : <IconPlayerPause />}
        >
          {paused ? i18n._('Resume') : i18n._('Pause')}
        </Button>
        <Button
          disabled={
            isPending('pause', 'resume', 'stop', 'record') || transitional
          }
          onClick={() => void command({ type: 'stop' })}
          variant="outline"
          color="danger"
          size="md"
          startIcon={<IconPlayerStop />}
        >
          {i18n._('Finish recording')}
        </Button>
      </div>
    </Card>
  );
};
