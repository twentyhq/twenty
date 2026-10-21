import { i18n } from '@lingui/core';
import { Banner } from 'twenty-ui/primitives/feedback';
import { IconX } from 'twenty-ui/icon';
import { isDefined } from 'twenty-ui/utilities';
import { type ActionProps } from '../types/ActionProps';
import { noticeMessage } from '../utils/noticeMessage';
import { NotificationEffect } from './NotificationEffect';

export const Notice = ({ state, command }: ActionProps) => {
  const dismiss = () => void command({ type: 'dismiss-error' });

  const notificationMessage =
    !isDefined(state.error) && state.notice?.type === 'recording-finished'
      ? noticeMessage(state.notice)
      : undefined;
  const shouldShowBanner =
    !isDefined(notificationMessage) &&
    (isDefined(state.error) || isDefined(state.notice));

  const recovery = state.error?.recovery;

  return (
    <>
      <NotificationEffect
        message={notificationMessage}
        closeLabel={i18n._('Dismiss message')}
        onClose={dismiss}
      />
      {shouldShowBanner && (
        <div
          className="notice"
          role={isDefined(state.error) ? 'alert' : 'status'}
        >
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
      )}
    </>
  );
};
