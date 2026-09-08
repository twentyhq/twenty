import { noticeMessage } from './notice-message';
import { Avatar } from '@ui/data-display/Avatar/Avatar';
import { H1Title, H1TitleFontColor } from '@ui/typography/H1Title/H1Title';
import { Card } from '@ui/surfaces/Card/Card';
import { Banner } from '@ui/feedback/Banner/Banner';
import { Notification } from './components/Notification/Notification';
import {
  OnboardingTitle,
  OnboardingSubtitle,
} from './components/OnboardingText/OnboardingText';
import {
  AnimatedPlaceholder,
  type AnimatedPlaceholderType,
} from '@ui/feedback/AnimatedPlaceholder/AnimatedPlaceholder';
import { Status as StatusChip } from '@ui/data-display/Status/Status';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { i18n } from '@lingui/core';
import { type ReactNode } from 'react';
import { Button } from '@ui/input/Button/Button';
import {
  IconPlayerPause,
  IconPlayerPlay,
  IconPlayerStop,
  IconX,
} from 'twenty-ui/icon';
import { type CompanionCommand, type CompanionState } from '../shared/types';
import { recordingLabel } from './format';
import { RecordingTimer } from './RecordingTimer';

export type ActionProps = {
  state: CompanionState;
  isPending: (...types: CompanionCommand['type'][]) => boolean;
  command: (command: CompanionCommand) => Promise<void>;
};
type SetupHeadingProps = {
  title: string;
  continuation?: string;
  description?: string;
};
export const SetupHeading = ({
  title,
  continuation,
  description,
}: SetupHeadingProps) => (
  <header className="setup-heading">
    <OnboardingTitle>
      {continuation ? (
        <>
          <span>{title}</span> <span>{continuation}</span>
        </>
      ) : (
        title
      )}
    </OnboardingTitle>
    {description && <OnboardingSubtitle>{description}</OnboardingSubtitle>}
  </header>
);
export const Notice = ({ state, command }: ActionProps) =>
  !state.error && state.notice?.type === 'recording-finished' ? (
    <div className="notification-container">
      <Notification
        message={noticeMessage(state.notice)}
        closeLabel={i18n._('Dismiss message')}
        onClose={() => void command({ type: 'dismiss-error' })}
      />
    </div>
  ) : state.error || state.notice ? (
    <div className="notice" role={state.error ? 'alert' : 'status'}>
      <Banner color={state.error ? 'danger' : 'blue'}>
        <span className="notice-text">
          {state.error?.message ??
            (state.notice && noticeMessage(state.notice))}
        </span>
        {state.error?.recovery && (
          <Button
            title={i18n._('Install Desktop Recorder')}
            variant="secondary"
            inverted
            onClick={() =>
              state.error?.recovery && void command(state.error.recovery)
            }
          />
        )}
        <IconButton
          className="notice-close"
          variant="tertiary"
          ariaLabel={i18n._('Dismiss message')}
          onClick={() => void command({ type: 'dismiss-error' })}
          size="medium"
          Icon={IconX}
        />
      </Banner>
    </div>
  ) : null;
export const Empty = ({
  icon,
  animatedPlaceholderType,
  title,
  children,
  actions,
}: {
  icon?: ReactNode;
  animatedPlaceholderType?: AnimatedPlaceholderType;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
}) => (
  <div className="empty">
    {animatedPlaceholderType ? (
      <AnimatedPlaceholder type={animatedPlaceholderType} assetBasePath="." />
    ) : (
      <span className="empty-icon">{icon}</span>
    )}
    <div className="empty-copy">
      <h2>{title}</h2>
      <div className="muted">{children}</div>
    </div>
    {actions && <div className="empty-actions">{actions}</div>}
  </div>
);
export const Status = ({ status }: { status: string }) => (
  <StatusChip
    color={
      status.toUpperCase() === 'FAILED'
        ? 'red'
        : status.toUpperCase() === 'PROCESSING'
          ? 'blue'
          : 'gray'
    }
    text={recordingLabel(status)}
  />
);
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
          placeholder={active.title}
          placeholderColorSeed={active.id}
          size="xl"
          type="rounded"
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
