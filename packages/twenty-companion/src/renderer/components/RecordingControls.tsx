import { Heading, Text } from 'twenty-ui/primitives/typography';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Card } from 'twenty-ui/primitives/surfaces';
import { i18n } from '@lingui/core';
import { Button } from 'twenty-ui/primitives/input';
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
    <Card.Root
      className="live-card"
      aria-label={i18n._('Current recording')}
      backgroundColor="var(--t-background-secondary)"
    >
      <Card.Content>
        <div className="live-heading">
          <Avatar
            name={active.title}
            colorSeed={active.id}
            size="xxl"
            shape="rounded-square"
          />
          <div className="grow live-recording-heading">
            <Heading level={2} size="lg">
              {active.title}
            </Heading>
            <Text className="small muted" role="status">
              {label} · <RecordingTimer recording={active} />
            </Text>
          </div>
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
      </Card.Content>
    </Card.Root>
  );
};
