import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk/front-component';

import { SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type SlackChannel = {
  id: string;
  name: string;
  isPrivate: boolean;
  isArchived: boolean;
  isMember: boolean;
  numMembers: number;
  topic: string;
  purpose: string;
};

type PostedMessage = {
  channelId: string;
  channelName: string;
  slackTs?: string;
};

type MessageFormat = 'plain' | 'markdown';

const FORMAT_OPTIONS: { value: MessageFormat; label: string }[] = [
  { value: 'plain', label: 'Plain text' },
  { value: 'markdown', label: 'Markdown' },
];

// The front component sandbox dispatches events with a non-standard shape.
// Values may live on e.detail.value, e.value, or e.target.value.
const readSerializedValue = (
  e: React.SyntheticEvent<HTMLElement>,
): string | undefined => {
  const obj = e as {
    detail?: { value?: string };
    value?: string;
    target?: { value?: string };
  };

  if (typeof obj.detail?.value === 'string') return obj.detail.value;
  if (typeof obj.value === 'string') return obj.value;
  if (typeof obj.target?.value === 'string') return obj.target.value;

  return undefined;
};

const onValueChange =
  (fn: (value: string) => void) => (e: React.SyntheticEvent<HTMLElement>) => {
    const v = readSerializedValue(e);

    if (typeof v === 'string') fn(v);
  };

const callAppRoute = async (
  path: string,
  method: 'GET' | 'POST',
  body?: Record<string, unknown>,
) => {
  const apiBaseUrl = process.env.TWENTY_API_URL;
  const token =
    process.env.TWENTY_APP_ACCESS_TOKEN ?? process.env.TWENTY_API_KEY;

  if (!apiBaseUrl || !token) {
    throw new Error('API configuration missing');
  }

  const response = await fetch(`${apiBaseUrl}/s${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');

    throw new Error(
      `Request failed (${response.status}): ${text.slice(0, 200)}`,
    );
  }

  return response.json();
};

const COLOR = {
  bg: '#f1f1f1',
  card: '#ffffff',
  surface: '#fcfcfc',
  border: '#ebebeb',
  borderStrong: '#d6d6d6',
  text: '#333333',
  textSecondary: '#666666',
  textTertiary: '#999999',
  placeholder: '#cccccc',
  // Slack aubergine
  accent: '#4a154b',
  accentSurface: '#f3eaf3',
  error: '#e05252',
};

const INLINE_SELECT: React.CSSProperties = {
  appearance: 'none',
  WebkitAppearance: 'none' as const,
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  font: 'inherit',
  cursor: 'pointer',
  outline: 'none',
  padding: 0,
};

const STYLES = {
  outer: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: '13px',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  container: {
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    display: 'flex',
    flexDirection: 'column' as const,
    height: '100%',
    boxSizing: 'border-box' as const,
    color: COLOR.text,
  },
  topBar: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px 12px',
    borderBottom: `1px solid ${COLOR.border}`,
    flexShrink: 0,
  },
  channelSelect: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    borderRadius: '6px',
    padding: '3px 8px',
    color: COLOR.text,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    minWidth: '160px',
  },
  optionsLoadingIndicator: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
  },
  spinner: {
    width: '14px',
    height: '14px',
    border: `2px solid ${COLOR.border}`,
    borderTopColor: COLOR.textSecondary,
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  chipsRow: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: '5px',
    alignItems: 'center',
    padding: '12px',
    borderBottom: `1px solid ${COLOR.border}`,
  },
  chip: {
    appearance: 'none' as const,
    WebkitAppearance: 'none' as const,
    background: 'transparent',
    border: `1px solid ${COLOR.border}`,
    borderRadius: '20px',
    padding: '3px 9px',
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    outline: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap' as const,
    lineHeight: '16px',
  },
  chipIcon: {
    fontSize: '10px',
    lineHeight: 1,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    overflow: 'auto',
    minHeight: 0,
    gap: '10px',
  },
  messageInput: {
    background: 'transparent',
    border: 'none',
    outline: 'none',
    color: COLOR.text,
    fontSize: '14px',
    fontFamily: 'inherit',
    width: '100%',
    padding: 0,
    resize: 'none' as const,
    flex: 1,
    minHeight: '160px',
  },
  actionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '6px',
    padding: '6px 12px',
    borderTop: `1px solid ${COLOR.border}`,
    flexShrink: 0,
  },
  cancelButton: {
    background: 'transparent',
    border: 'none',
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 10px',
    borderRadius: '6px',
  },
  sendButton: {
    background: COLOR.accent,
    border: 'none',
    color: '#ffffff',
    fontSize: '12px',
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 14px',
    borderRadius: '6px',
  },
  sendButtonDisabled: {
    background: COLOR.borderStrong,
    color: COLOR.textTertiary,
    cursor: 'not-allowed',
  },
  successOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  successContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    boxSizing: 'border-box' as const,
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    color: COLOR.text,
  },
  successCheck: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: '#2ea043',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: '#fff',
    flexShrink: 0,
  },
  successText: {
    color: COLOR.text,
    fontWeight: 500,
    fontSize: '13px',
    flex: 1,
    overflow: 'hidden' as const,
    textOverflow: 'ellipsis' as const,
    whiteSpace: 'nowrap' as const,
  },
  closeButton: {
    background: 'transparent',
    border: `1px solid ${COLOR.border}`,
    color: COLOR.textSecondary,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 14px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  sendAnotherButton: {
    background: COLOR.accentSurface,
    border: `1px solid ${COLOR.accent}`,
    color: COLOR.accent,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 14px',
    borderRadius: '6px',
    flexShrink: 0,
  },
  loadingOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  loadingContainer: {
    color: COLOR.textSecondary,
    fontSize: '13px',
    textAlign: 'center' as const,
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    padding: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorOuter: {
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    backgroundColor: COLOR.bg,
    padding: '12px',
    height: '100%',
    boxSizing: 'border-box' as const,
  },
  errorContainer: {
    backgroundColor: COLOR.card,
    borderRadius: '8px',
    border: `1px solid ${COLOR.border}`,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
  },
  errorText: {
    color: COLOR.error,
    fontSize: '12px',
    textAlign: 'center' as const,
  },
  retryButton: {
    background: COLOR.surface,
    border: `1px solid ${COLOR.border}`,
    color: COLOR.text,
    fontSize: '12px',
    fontFamily: 'inherit',
    cursor: 'pointer',
    padding: '5px 12px',
    borderRadius: '6px',
  },
};

const sortChannels = (channels: SlackChannel[]): SlackChannel[] =>
  [...channels].sort((a, b) => {
    if (a.isMember !== b.isMember) {
      return a.isMember ? -1 : 1;
    }

    return a.name.localeCompare(b.name);
  });

const SendMessageForm = () => {
  const [channels, setChannels] = useState<SlackChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [postedMessage, setPostedMessage] = useState<PostedMessage | null>(
    null,
  );
  const [closing, setClosing] = useState(false);

  const [channelId, setChannelId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [messageFormat, setMessageFormat] = useState<MessageFormat>('markdown');

  const fetchChannels = useCallback(async () => {
    try {
      setChannelsError(null);
      setChannelsLoading(true);

      const result = await callAppRoute('/slack/channels?limit=200', 'GET');

      if (!result.success) {
        setChannelsError(result.error ?? 'Failed to load channels');

        return;
      }

      const sorted = sortChannels(result.channels ?? []);

      setChannels(sorted);

      const firstMemberChannel = sorted.find((channel) => channel.isMember);

      if (firstMemberChannel !== undefined) {
        setChannelId(firstMemberChannel.id);
      } else if (sorted.length === 1) {
        setChannelId(sorted[0].id);
      }
    } catch (error) {
      setChannelsError(
        error instanceof Error ? error.message : 'Failed to load channels',
      );
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const resetForm = useCallback(() => {
    setMessageText('');
    setPostedMessage(null);
  }, []);

  const handleSubmit = async () => {
    const trimmedMessage = messageText.trim();

    if (!channelId || !trimmedMessage) {
      return;
    }

    setSubmitting(true);

    try {
      const result = await callAppRoute('/slack/messages', 'POST', {
        slackChannelId: channelId,
        messageText: trimmedMessage,
        messageFormat,
      });

      if (!result.success) {
        await enqueueSnackbar({
          message: result.error ?? result.message ?? 'Failed to send message',
          variant: 'error',
        });
        setSubmitting(false);

        return;
      }

      const channel = channels.find((c) => c.id === channelId);

      setPostedMessage({
        channelId,
        channelName: channel?.name ?? channelId,
        slackTs: result.slackTs,
      });
      setSubmitting(false);

      await enqueueSnackbar({
        message: `Message sent to #${channel?.name ?? channelId}`,
        variant: 'success',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to send message',
        variant: 'error',
      });
      setSubmitting(false);
    }
  };

  const handleCancel = () => {
    setClosing(true);
    unmountFrontComponent();
    closeSidePanel();
  };

  if (closing) {
    return null;
  }

  if (postedMessage) {
    return (
      <div style={STYLES.successOuter}>
        <div style={STYLES.successContainer}>
          <div style={STYLES.successCheck}>{'✓'}</div>
          <span style={STYLES.successText}>
            Sent to #{postedMessage.channelName}
          </span>
          <button
            type="button"
            style={STYLES.sendAnotherButton}
            onClick={resetForm}
          >
            Send another
          </button>
          <button
            type="button"
            style={STYLES.closeButton}
            onClick={handleCancel}
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (channelsLoading) {
    return (
      <div style={STYLES.loadingOuter}>
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
        <div style={STYLES.loadingContainer}>Loading channels...</div>
      </div>
    );
  }

  if (channelsError) {
    return (
      <div style={STYLES.errorOuter}>
        <div style={STYLES.errorContainer}>
          <p style={STYLES.errorText}>{channelsError}</p>
          <button
            type="button"
            style={STYLES.retryButton}
            onClick={fetchChannels}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const canSubmit = channelId && messageText.trim() && !submitting;
  const selectedChannel = channels.find((c) => c.id === channelId);

  return (
    <div style={STYLES.outer}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={STYLES.container}>
        <div style={STYLES.topBar}>
          <select
            value={channelId}
            onChange={onValueChange(setChannelId)}
            style={STYLES.channelSelect}
          >
            <option value="">Select channel...</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.isPrivate ? '🔒' : '#'} {channel.name}
                {channel.isMember ? '' : ' (not a member)'}
              </option>
            ))}
          </select>
        </div>

        <div style={STYLES.chipsRow}>
          <label style={STYLES.chip}>
            <span style={STYLES.chipIcon}>{'¶'}</span>
            <select
              value={messageFormat}
              onChange={onValueChange((v) =>
                setMessageFormat(v as MessageFormat),
              )}
              style={INLINE_SELECT}
            >
              {FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {selectedChannel !== undefined && !selectedChannel.isMember && (
            <span
              style={{
                ...STYLES.chip,
                color: COLOR.error,
                borderColor: COLOR.error,
                cursor: 'default',
              }}
            >
              Bot is not a member of this channel
            </span>
          )}
        </div>

        <div style={STYLES.body}>
          <textarea
            value={messageText}
            onInput={onValueChange(setMessageText)}
            onChange={onValueChange(setMessageText)}
            style={STYLES.messageInput}
            placeholder={
              messageFormat === 'markdown'
                ? 'Write your message... (markdown supported)'
                : 'Write your message...'
            }
          />
        </div>

        <div style={STYLES.actionBar}>
          <button
            type="button"
            style={STYLES.cancelButton}
            onClick={handleCancel}
          >
            Cancel
          </button>
          <button
            type="button"
            style={{
              ...STYLES.sendButton,
              ...(!canSubmit ? STYLES.sendButtonDisabled : {}),
            }}
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {submitting ? 'Sending...' : 'Send message'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-slack-message-form',
  description:
    'Form to send a Slack message to any channel the bot can post to, with plain-text or markdown formatting.',
  component: SendMessageForm,
});
