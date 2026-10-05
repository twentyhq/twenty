export const appendHtmlFooter = (html: string, footer: string): string => {
  const closingBodyIndex = html.search(/<\/body>(?![\s\S]*<\/body>)/i);

  if (closingBodyIndex !== -1) {
    return (
      html.slice(0, closingBodyIndex) + footer + html.slice(closingBodyIndex)
    );
  }

  const closingHtmlIndex = html.search(/<\/html>(?![\s\S]*<\/html>)/i);

  if (closingHtmlIndex !== -1) {
    return (
      html.slice(0, closingHtmlIndex) + footer + html.slice(closingHtmlIndex)
    );
  }

  return `${html}${footer}`;
};
