import { useCallback, useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  closeSidePanel,
  enqueueSnackbar,
  unmountFrontComponent,
} from 'twenty-sdk/front-component';

import { SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER } from 'src/constants/universal-identifiers';

type DiscordGuild = {
  id: string;
  name: string;
};

type DiscordChannel = {
  id: string;
  name: string;
  type: number;
  parentId: string | null;
  position: number;
};

const DISCORD_MESSAGE_MAX_LENGTH = 2000;

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
  accent: '#5865f2',
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
  guildSelect: {
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
  },
  channelPicker: {
    flexShrink: 0,
    padding: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    borderBottom: `1px solid ${COLOR.border}`,
  },
  channelChip: {
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
    display: 'inline-flex' as const,
    alignItems: 'center',
    gap: '4px',
    whiteSpace: 'nowrap' as const,
    lineHeight: '16px',
  },
  chipIcon: {
    fontSize: '12px',
    lineHeight: 1,
    flexShrink: 0,
    color: COLOR.textTertiary,
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
  body: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column' as const,
    padding: '24px',
    overflow: 'auto',
    minHeight: 0,
    gap: '6px',
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
    minHeight: '120px',
  },
  charCount: {
    fontSize: '11px',
    textAlign: 'right' as const,
    color: COLOR.textTertiary,
    flexShrink: 0,
  },
  charCountOverLimit: {
    color: COLOR.error,
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

const SendMessageForm = () => {
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [guildsLoading, setGuildsLoading] = useState(true);
  const [guildsError, setGuildsError] = useState<string | null>(null);

  const [channels, setChannels] = useState<DiscordChannel[]>([]);
  const [channelsLoading, setChannelsLoading] = useState(false);

  const [selectedGuildId, setSelectedGuildId] = useState('');
  const [selectedChannelId, setSelectedChannelId] = useState('');
  const [messageText, setMessageText] = useState('');

  const [sending, setSending] = useState(false);
  const [sentChannelName, setSentChannelName] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);

  const fetchChannels = useCallback(async (guildId: string) => {
    if (!guildId) {
      setChannels([]);
      setSelectedChannelId('');

      return;
    }

    setChannelsLoading(true);

    try {
      const result = await callAppRoute(
        `/discord/channels?guildId=${encodeURIComponent(guildId)}`,
        'GET',
      );

      if (!result.success) {
        setChannels([]);
        await enqueueSnackbar({
          message: result.error ?? 'Failed to load channels',
          variant: 'error',
        });

        return;
      }

      setChannels(result.channels ?? []);
    } catch (error) {
      setChannels([]);
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to load channels',
        variant: 'error',
      });
    } finally {
      setChannelsLoading(false);
    }
  }, []);

  const handleGuildChange = useCallback(
    (newGuildId: string) => {
      setSelectedGuildId(newGuildId);
      setSelectedChannelId('');
      fetchChannels(newGuildId);
    },
    [fetchChannels],
  );

  const fetchGuilds = useCallback(async () => {
    try {
      setGuildsError(null);
      const result = await callAppRoute('/discord/guilds', 'GET');

      if (!result.success) {
        setGuildsError(result.error ?? 'Failed to load Discord servers');

        return;
      }

      const fetchedGuilds: DiscordGuild[] = result.guilds ?? [];

      setGuilds(fetchedGuilds);

      // Auto-select when the bot is in exactly one server to skip a needless step.
      if (fetchedGuilds.length === 1) {
        setSelectedGuildId(fetchedGuilds[0].id);
        fetchChannels(fetchedGuilds[0].id);
      }
    } catch (error) {
      setGuildsError(
        error instanceof Error
          ? error.message
          : 'Failed to load Discord servers',
      );
    } finally {
      setGuildsLoading(false);
    }
  }, [fetchChannels]);

  useEffect(() => {
    fetchGuilds();
  }, [fetchGuilds]);

  const handleSubmit = async () => {
    const trimmedMessage = (messageText ?? '').trim();

    if (
      !selectedGuildId ||
      !selectedChannelId ||
      trimmedMessage.length === 0 ||
      trimmedMessage.length > DISCORD_MESSAGE_MAX_LENGTH
    ) {
      return;
    }

    setSending(true);

    try {
      const result = await callAppRoute('/discord/messages', 'POST', {
        channelId: selectedChannelId,
        messageText: trimmedMessage,
      });

      if (!result.success) {
        await enqueueSnackbar({
          message: result.error ?? 'Failed to send message',
          variant: 'error',
        });
        setSending(false);

        return;
      }

      const channelName =
        channels.find((channel) => channel.id === selectedChannelId)?.name ??
        'channel';

      setSentChannelName(channelName);
      await enqueueSnackbar({
        message: `Message sent to #${channelName}`,
        variant: 'success',
      });
    } catch (error) {
      await enqueueSnackbar({
        message:
          error instanceof Error ? error.message : 'Failed to send message',
        variant: 'error',
      });
      setSending(false);
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

  if (sentChannelName) {
    return (
      <div style={STYLES.successOuter}>
        <div style={STYLES.successContainer}>
          <div style={STYLES.successCheck}>{'✓'}</div>
          <span style={STYLES.successText}>
            Message sent to #{sentChannelName}
          </span>
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

  if (guildsLoading) {
    return (
      <div style={STYLES.loadingOuter}>
        <div style={STYLES.loadingContainer}>Loading...</div>
      </div>
    );
  }

  if (guildsError) {
    return (
      <div style={STYLES.errorOuter}>
        <div style={STYLES.errorContainer}>
          <p style={STYLES.errorText}>{guildsError}</p>
          <button
            type="button"
            style={STYLES.retryButton}
            onClick={fetchGuilds}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const trimmedLength = (messageText ?? '').trim().length;
  const isOverLimit = (messageText ?? '').length > DISCORD_MESSAGE_MAX_LENGTH;
  const canSubmit =
    !!selectedGuildId &&
    !!selectedChannelId &&
    trimmedLength > 0 &&
    !isOverLimit &&
    !sending;

  return (
    <div style={STYLES.outer}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={STYLES.container}>
        <div style={STYLES.topBar}>
          <select
            value={selectedGuildId}
            onChange={onValueChange(handleGuildChange)}
            style={STYLES.guildSelect}
          >
            <option value="">Select server...</option>
            {guilds.map((guild) => (
              <option key={guild.id} value={guild.id}>
                {guild.name}
              </option>
            ))}
          </select>
          {channelsLoading && (
            <div style={STYLES.optionsLoadingIndicator}>
              <div style={STYLES.spinner} />
            </div>
          )}
        </div>

        <div style={STYLES.channelPicker}>
          <label style={STYLES.channelChip}>
            <span style={STYLES.chipIcon}>{'#'}</span>
            <select
              value={selectedChannelId}
              onChange={onValueChange(setSelectedChannelId)}
              style={INLINE_SELECT}
              disabled={!selectedGuildId || channelsLoading}
            >
              <option value="">
                {channels.length === 0 ? 'No channels' : 'Select channel'}
              </option>
              {channels.map((channel) => (
                <option key={channel.id} value={channel.id}>
                  {channel.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div style={STYLES.body}>
          <textarea
            value={messageText}
            onInput={onValueChange(setMessageText)}
            onChange={onValueChange(setMessageText)}
            style={STYLES.messageInput}
            placeholder="Type a message..."
          />
          <div
            style={{
              ...STYLES.charCount,
              ...(isOverLimit ? STYLES.charCountOverLimit : {}),
            }}
          >
            {(messageText ?? '').length} / {DISCORD_MESSAGE_MAX_LENGTH}
          </div>
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
            {sending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: SEND_MESSAGE_FORM_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'send-discord-message-form',
  description:
    'Form to send a message to a Discord channel: pick the server, pick the channel, type the message, send.',
  component: SendMessageForm,
});
