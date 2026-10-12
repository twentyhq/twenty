const URL_REGEX = /https?:\/\/[^\s<>[\]]+[^\s<>[\].,;:!?)]/g;

type LinkifyMatch = {
  type: 'text' | 'link';
  content: string;
};

export const linkifyText = (text: string): LinkifyMatch[] => {
  const parts: LinkifyMatch[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(URL_REGEX)) {
    const { 0: url, index } = match;

    if (index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, index) });
    }
    parts.push({ type: 'link', content: url });
    lastIndex = index + url.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }

  return parts;
};
