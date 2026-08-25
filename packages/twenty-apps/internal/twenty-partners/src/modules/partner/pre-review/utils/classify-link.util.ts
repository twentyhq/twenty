export type LinkClassification =
  | 'twenty-instance'
  | 'site'
  | 'github'
  | 'video-youtube'
  | 'video-loom'
  | 'video-tella'
  | 'video-other'
  | 'drive-or-filedrop'
  | 'linkedin'
  | 'dead';

export type LinkFetchOutcome = {
  status: number | null;
  html: string | null;
  isTimeout: boolean;
};

const LINKEDIN_HOSTS = ['linkedin.com', 'lnkd.in'];
const CODE_HOSTS = ['github.com', 'gitlab.com'];
const FILE_DROP_HOSTS = [
  'drive.google.com',
  'docs.google.com',
  'dropbox.com',
  'wetransfer.com',
  'we.tl',
  'sharepoint.com',
  '1drv.ms',
  'onedrive.live.com',
];

const VIDEO_HOSTS: { host: string; classification: LinkClassification }[] = [
  { host: 'youtube.com', classification: 'video-youtube' },
  { host: 'youtu.be', classification: 'video-youtube' },
  { host: 'loom.com', classification: 'video-loom' },
  { host: 'tella.tv', classification: 'video-tella' },
  { host: 'vimeo.com', classification: 'video-other' },
  { host: 'droplr.com', classification: 'video-other' },
  { host: 'd.pr', classification: 'video-other' },
  { host: 'vidyard.com', classification: 'video-other' },
];

const TWENTY_APP_SHELL_MARKERS = [
  '<title>Twenty',
  'twenty-front',
  '__twentyServerUrl',
];

const parseHostname = (url: string): string | null => {
  try {
    const { hostname, protocol } = new URL(url);
    if (protocol !== 'http:' && protocol !== 'https:') return null;
    return hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
};

const matchesHost = (hostname: string, host: string): boolean =>
  hostname === host || hostname.endsWith(`.${host}`);

const matchesAnyHost = (hostname: string, hosts: string[]): boolean =>
  hosts.some((host) => matchesHost(hostname, host));

// A 404 or a DNS failure is evidence against the applicant; an auth wall or a
// timeout says nothing about them, so it must not downgrade the link.
const isHardFetchFailure = (outcome: LinkFetchOutcome): boolean => {
  if (outcome.isTimeout) return false;
  if (outcome.status === null) return true;
  if (
    outcome.status === 401 ||
    outcome.status === 403 ||
    outcome.status === 429
  ) {
    return false;
  }
  return outcome.status >= 400;
};

const hasTwentyAppShell = (html: string | null): boolean =>
  html !== null &&
  TWENTY_APP_SHELL_MARKERS.some((marker) => html.includes(marker));

export const classifyLink = ({
  url,
  outcome,
}: {
  url: string;
  outcome: LinkFetchOutcome;
}): LinkClassification => {
  const hostname = parseHostname(url);
  if (hostname === null) return 'dead';

  // LinkedIn answers automated fetches with HTTP 999, so its status is never
  // trustworthy — the host decides before any status check.
  if (matchesAnyHost(hostname, LINKEDIN_HOSTS)) return 'linkedin';

  if (isHardFetchFailure(outcome)) return 'dead';

  if (matchesAnyHost(hostname, CODE_HOSTS)) return 'github';

  const videoHost = VIDEO_HOSTS.find(({ host }) => matchesHost(hostname, host));
  if (videoHost !== undefined) return videoHost.classification;

  if (matchesAnyHost(hostname, FILE_DROP_HOSTS)) return 'drive-or-filedrop';

  if (hasTwentyAppShell(outcome.html)) return 'twenty-instance';

  return 'site';
};

export const isVideoClassification = (
  classification: LinkClassification,
): boolean => classification.startsWith('video-');
