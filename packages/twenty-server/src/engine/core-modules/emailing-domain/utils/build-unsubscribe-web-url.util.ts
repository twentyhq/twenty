type BuildUnsubscribeWebUrlArgs = {
  unsubscribeBaseUrl: string;
  token: string;
};

export const buildUnsubscribeWebUrl = ({
  unsubscribeBaseUrl,
  token,
}: BuildUnsubscribeWebUrlArgs): string =>
  `${unsubscribeBaseUrl}/emailing/unsubscribe?t=${token}`;
