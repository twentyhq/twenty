export const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/(\*\*|__)(\S(?:.*?\S)?)\1/g, '$2')
    .replace(/~~(\S(?:.*?\S)?)~~/g, '$1')
    .replace(/\*(\S(?:.*?\S)?)\*/g, '$1')
    .replace(/(^|[^\w])_(\S(?:.*?\S)?)_(?![\w])/g, '$1$2')
    .replace(/\s+/g, ' ')
    .trim();
