import { decodeHtmlEntities } from 'src/modules/partner/pre-review/utils/decode-html-entities.util';

export type OpenGraphMetadata = {
  title: string | null;
  description: string | null;
  imageUrl: string | null;
};

const readMetaContent = (html: string, property: string): string | null => {
  const escapedProperty = property.replace(':', '\\:');
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${escapedProperty}["'][^>]*content=["']([^"']*)["']`,
      'i',
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']*)["'][^>]*(?:property|name)=["']${escapedProperty}["']`,
      'i',
    ),
  ];

  for (const pattern of patterns) {
    const match = pattern.exec(html);
    if (match?.[1] !== undefined && match[1].trim().length > 0) {
      return decodeHtmlEntities(match[1]).trim();
    }
  }

  return null;
};

const readTitleTag = (html: string): string | null => {
  const match = /<title[^>]*>([\s\S]*?)<\/title>/i.exec(html);
  if (match?.[1] === undefined) return null;

  const title = decodeHtmlEntities(match[1]).replace(/\s+/g, ' ').trim();

  return title.length === 0 ? null : title;
};

export const extractOpenGraph = (html: string | null): OpenGraphMetadata => {
  if (html === null) {
    return { title: null, description: null, imageUrl: null };
  }

  return {
    title: readMetaContent(html, 'og:title') ?? readTitleTag(html),
    description:
      readMetaContent(html, 'og:description') ??
      readMetaContent(html, 'description'),
    imageUrl: readMetaContent(html, 'og:image'),
  };
};
