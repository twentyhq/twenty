export const stripMarkdown = (markdown: string): string =>
  markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_~`-]/g, ' ')
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
