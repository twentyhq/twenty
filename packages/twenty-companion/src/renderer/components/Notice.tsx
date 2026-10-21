import { i18n } from '@lingui/core';
import { Banner } from 'twenty-ui/primitives/feedback';
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
            onDismiss={dismiss}
            closeLabel={i18n._('Dismiss message')}
            action={
              isDefined(recovery) ? (
                <Banner.Action onClick={() => void command(recovery)}>
                  {i18n._('Install Desktop Recorder')}
                </Banner.Action>
              ) : undefined
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
