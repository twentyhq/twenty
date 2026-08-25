import {
  PUBLIC_WEB_FETCH_TIMEOUT_MS,
  PUBLIC_WEB_MAX_HTML_CHARS,
  PUBLIC_WEB_USER_AGENT,
} from 'src/modules/partner/pre-review/connector/public-web/config';
import { type PublicWebPage } from 'src/modules/partner/pre-review/connector/public-web/types';
import { extractCaptionText } from 'src/modules/partner/pre-review/utils/extract-caption-text.util';
import { extractYoutubeCaptionTrackUrl } from 'src/modules/partner/pre-review/utils/extract-youtube-caption-track-url.util';

export const fetchPublicWebPage = async (
  url: string,
  timeoutMs: number = PUBLIC_WEB_FETCH_TIMEOUT_MS,
): Promise<PublicWebPage> => {
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
