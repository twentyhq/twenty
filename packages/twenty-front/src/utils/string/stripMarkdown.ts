export const stripMarkdown = (value: string) =>
  value
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '$1')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1')
    .replace(/^>\s?/gm, '')
    .replace(/^\s{0,3}(?:[-*+]\s+|\d+\.\s+)/gm, '')
    .replace(/[*_~`#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
