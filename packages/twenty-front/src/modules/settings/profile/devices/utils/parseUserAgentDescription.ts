import { isNonEmptyString } from '@sniptt/guards';

type UserAgentMatcher = {
  label: string;
  pattern: RegExp;
};

// Order matters: Edge and Opera user agents contain "Chrome", and Chrome's contains "Safari"
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
): { browser?: string; operatingSystem?: string } => {
  if (!isNonEmptyString(userAgent)) {
    return {};
  }

  return {
    browser: BROWSER_MATCHERS.find(({ pattern }) => pattern.test(userAgent))
      ?.label,
    operatingSystem: OPERATING_SYSTEM_MATCHERS.find(({ pattern }) =>
      pattern.test(userAgent),
    )?.label,
  };
};
