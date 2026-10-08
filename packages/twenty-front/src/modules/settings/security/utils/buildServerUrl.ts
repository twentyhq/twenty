export const buildServerUrl = ({
  serverUrl,
  pathname,
}: {
  serverUrl: string;
  pathname: string;
}) => {
  const url = new URL(serverUrl);

  url.pathname = pathname;

  return url.toString();
};
