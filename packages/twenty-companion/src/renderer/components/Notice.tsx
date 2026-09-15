import { noticeMessage } from '../utils/noticeMessage';
import { Banner } from '@ui/feedback/Banner/Banner';
import { Notification } from './Notification';
import { IconButton } from '@ui/input/IconButton/IconButton';
import { i18n } from '@lingui/core';
import { Button } from '@ui/input/Button/Button';
import { IconX } from 'twenty-ui/icon';
import { type ActionProps } from '../types/ActionProps';

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
