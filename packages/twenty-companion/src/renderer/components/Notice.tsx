import { i18n } from '@lingui/core';
import { Banner } from 'twenty-ui/primitives/feedback';
import { IconX } from 'twenty-ui/icon';
import { isDefined } from 'twenty-ui/utilities';
import { type ActionProps } from '../types/ActionProps';
import { noticeMessage } from '../utils/noticeMessage';
import { Notification } from './Notification';

export const Notice = ({ state, command }: ActionProps) => {
  const dismiss = () => void command({ type: 'dismiss-error' });

  if (!isDefined(state.error) && state.notice?.type === 'recording-finished') {
    return (
      <Notification
        message={noticeMessage(state.notice)}
        closeLabel={i18n._('Dismiss message')}
        onClose={dismiss}
      />
    );
  }

  if (!isDefined(state.error) && !isDefined(state.notice)) {
    return null;
  }

  const recovery = state.error?.recovery;

  return (
    <div className="notice" role={isDefined(state.error) ? 'alert' : 'status'}>
      <Banner
        status={isDefined(state.error) ? 'error' : 'info'}
        action={
          <div className="notice-actions">
            {isDefined(recovery) && (
              <Banner.Action onClick={() => void command(recovery)}>
                {i18n._('Install Desktop Recorder')}
              </Banner.Action>
            )}
            <Banner.Action
              aria-label={i18n._('Dismiss message')}
              startIcon={<IconX />}
              onClick={dismiss}
            />
          </div>
        }
      >
        {state.error?.message ??
          (isDefined(state.notice) ? noticeMessage(state.notice) : null)}
      </Banner>
    </div>
  );
};
