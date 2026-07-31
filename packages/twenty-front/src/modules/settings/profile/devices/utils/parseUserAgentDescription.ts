import { isNonEmptyString } from '@sniptt/guards';

type UserAgentMatcher = {
  label: string;
  pattern: RegExp;
};

// Order matters: several browsers embed competitor tokens in their user
// agent (Edge and Opera contain "Chrome", Chrome contains "Safari").
const BROWSER_MATCHERS: UserAgentMatcher[] = [
  { label: 'Edge', pattern: /Edg(e|A|iOS)?\// },
  { label: 'Opera', pattern: /(OPR|Opera)\// },
  { label: 'Samsung Internet', pattern: /SamsungBrowser\// },
  { label: 'Firefox', pattern: /(Firefox|FxiOS)\// },
  { label: 'Chrome', pattern: /(Chrome|CriOS)\// },
  { label: 'Safari', pattern: /Safari\// },
];

const OPERATING_SYSTEM_MATCHERS: UserAgentMatcher[] = [
  { label: 'Android', pattern: /Android/ },
  { label: 'iOS', pattern: /(iPhone|iPad|iPod)/ },
  { label: 'Windows', pattern: /Windows/ },
  { label: 'macOS', pattern: /Mac OS X|Macintosh/ },
  { label: 'Chrome OS', pattern: /CrOS/ },
  { label: 'Linux', pattern: /Linux/ },
];

export const parseUserAgentDescription = (
  userAgent: string | null | undefined,
): string => {
  if (!isNonEmptyString(userAgent)) {
    return 'Unknown device';
  }

  const browser = BROWSER_MATCHERS.find(({ pattern }) =>
    pattern.test(userAgent),
  )?.label;

  const operatingSystem = OPERATING_SYSTEM_MATCHERS.find(({ pattern }) =>
    pattern.test(userAgent),
  )?.label;

  if (browser && operatingSystem) {
    return `${browser} on ${operatingSystem}`;
  }

  return browser ?? operatingSystem ?? 'Unknown device';
};
