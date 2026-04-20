import { ATTACHMENT_KEYWORDS_BY_LOCALE } from '@/activities/emails/constants/AttachmentKeywordsByLocale';

const CJK_RANGE = /[\u3000-\u9fff\uac00-\ud7af\uf900-\ufaff]/;

const needsWordBoundary = (keyword: string): boolean => {
  return !CJK_RANGE.test(keyword);
};

const buildKeywordPattern = (keywords: string[]): RegExp => {
  const parts = keywords.map((keyword) => {
    const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    return needsWordBoundary(keyword) ? `\\b${escaped}\\b` : escaped;
  });

  return new RegExp(`(${parts.join('|')})`, 'i');
};

export const bodyMentionsAttachment = (
  htmlBody: string,
  locale: string,
): boolean => {
  const plainText = htmlBody.replace(/<[^>]*>/g, ' ');

  const baseLocale = locale.split('-')[0];
  const keywords =
    ATTACHMENT_KEYWORDS_BY_LOCALE[locale] ??
    ATTACHMENT_KEYWORDS_BY_LOCALE[baseLocale] ??
    ATTACHMENT_KEYWORDS_BY_LOCALE['en'] ??
    [];

  if (keywords.length === 0) {
    return false;
  }

  const pattern = buildKeywordPattern(keywords);

  return pattern.test(plainText);
};
