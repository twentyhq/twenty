import {
  PUBLIC_WEB_FETCH_TIMEOUT_MS,
  PUBLIC_WEB_MAX_HTML_CHARS,
  PUBLIC_WEB_USER_AGENT,
} from 'src/modules/partner/pre-review/connector/public-web/config';
import { type PublicWebPage } from 'src/modules/partner/pre-review/connector/public-web/types';
import { extractCaptionText } from 'src/modules/partner/pre-review/utils/extract-caption-text.util';
import { extractYoutubeCaptionTrackUrl } from 'src/modules/partner/pre-review/utils/extract-youtube-caption-track-url.util';
import { isHttpUrl } from 'src/modules/shared/utils/http-url.util';

const BLOCKED_ERROR_MESSAGE = 'blocked: private address';

const BLOCKED_HOSTNAME_SUFFIXES = ['.internal', '.local', '.localhost'];

const IPV4_PATTERN = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;

// 0/8, 10/8, 127/8, 169.254/16, 172.16/12 and 192.168/16 all reach the machine
// that runs the fetch or its neighbours on the private network.
const isPrivateIpv4 = (hostname: string): boolean => {
  const match = IPV4_PATTERN.exec(hostname);
  if (match === null) return false;

  const first = Number(match[1]);
  const second = Number(match[2]);

  return (
    first === 0 ||
    first === 10 ||
    first === 127 ||
    (first === 169 && second === 254) ||
    (first === 172 && second >= 16 && second <= 31) ||
    (first === 192 && second === 168)
  );
};

// URL keeps the brackets around an IPv6 literal; fc00::/7 is unique-local and
// fe80::/10 is link-local.
const isPrivateIpv6 = (hostname: string): boolean => {
  const address = hostname.replace(/^\[|\]$/g, '').toLowerCase();

  if (address === '::1' || address === '::') return true;

  return /^(f[cd]|fe[89ab])/.test(address);
};

const isBlockedHostname = (hostname: string): boolean => {
  const host = hostname.toLowerCase();

  if (host === 'localhost') return true;
  if (BLOCKED_HOSTNAME_SUFFIXES.some((suffix) => host.endsWith(suffix))) {
    return true;
  }

  return isPrivateIpv4(host) || isPrivateIpv6(host);
};

// The applicant chooses these URLs, so a fetch is an SSRF primitive unless the
// scheme and the host are both checked — before the request and again on the
// URL the redirect chain actually landed on.
const isBlockedTarget = (url: string): boolean => {
  if (!isHttpUrl(url)) return true;

  return isBlockedHostname(new URL(url).hostname);
};

const blockedPage = (url: string): PublicWebPage => ({
  url,
  finalUrl: null,
  status: null,
  isTimeout: false,
  html: null,
  errorMessage: BLOCKED_ERROR_MESSAGE,
});

export const fetchPublicWebPage = async (
  url: string,
  timeoutMs: number = PUBLIC_WEB_FETCH_TIMEOUT_MS,
): Promise<PublicWebPage> => {
  if (isBlockedTarget(url)) return blockedPage(url);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': PUBLIC_WEB_USER_AGENT,
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: controller.signal,
    });

    if (response.url.length > 0 && isBlockedTarget(response.url)) {
      return blockedPage(url);
    }

    const body = await response.text();

    return {
      url,
      finalUrl: response.url.length === 0 ? null : response.url,
      status: response.status,
      isTimeout: false,
      html: body.slice(0, PUBLIC_WEB_MAX_HTML_CHARS),
      errorMessage: null,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      url,
      finalUrl: null,
      status: null,
      isTimeout: error instanceof Error && error.name === 'AbortError',
      html: null,
      errorMessage: message,
    };
  } finally {
    clearTimeout(timeout);
  }
};

export const fetchYoutubeCaptionText = async (
  watchPageHtml: string,
): Promise<string | null> => {
  const captionTrackUrl = extractYoutubeCaptionTrackUrl(watchPageHtml);
  if (captionTrackUrl === null) return null;

  const captionPage = await fetchPublicWebPage(captionTrackUrl);
  if (captionPage.html === null) return null;

  const transcript = extractCaptionText(captionPage.html);

  return transcript.length === 0 ? null : transcript;
};
