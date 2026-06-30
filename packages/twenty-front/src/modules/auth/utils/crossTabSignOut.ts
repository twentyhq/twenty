const SIGN_OUT_CHANNEL_NAME = 'twenty-sign-out';

let sharedChannel: BroadcastChannel | null = null;

const getSharedSignOutChannel = (): BroadcastChannel | null => {
  if (sharedChannel) {
    return sharedChannel;
  }

  try {
    sharedChannel = new BroadcastChannel(SIGN_OUT_CHANNEL_NAME);
  } catch {
    return null;
  }

  return sharedChannel;
};

export const broadcastSignOutToOtherTabs = () => {
  getSharedSignOutChannel()?.postMessage({ type: 'sign-out' });
};

export const subscribeToSignOutFromOtherTabs = (
  callback: () => void,
): (() => void) => {
  const channel = getSharedSignOutChannel();

  if (!channel) {
    return () => {};
  }

  channel.onmessage = (event: MessageEvent) => {
    if (event.data?.type === 'sign-out') {
      callback();
    }
  };

  return () => {
    channel.onmessage = null;
  };
};
