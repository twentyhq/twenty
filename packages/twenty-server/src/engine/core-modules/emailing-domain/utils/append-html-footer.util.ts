export const appendHtmlFooter = (html: string, footer: string): string => {
  const closingBodyIndex = html.toLowerCase().lastIndexOf('</body>');

  if (closingBodyIndex !== -1) {
    return (
      html.slice(0, closingBodyIndex) + footer + html.slice(closingBodyIndex)
    );
  }

  const closingHtmlIndex = html.toLowerCase().lastIndexOf('</html>');

  if (closingHtmlIndex !== -1) {
    return (
      html.slice(0, closingHtmlIndex) + footer + html.slice(closingHtmlIndex)
    );
  }

  return `${html}${footer}`;
};
