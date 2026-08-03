// Content placed after </body> or </html> is outside the document, and mail
// clients routinely strip it, which would drop the unsubscribe link. The
// footer is injected before the closing tag when the body is a full document.
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
