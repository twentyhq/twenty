export const sanitizeRecordLinks = (
    recordObject: Record<string, any>,
  ): Record<string, any> => {
    return { ...recordObject, domainName: sanitizeLink(recordObject.domainName) };
  };
  const sanitizeLink = (link: string): string => {
    let cleanedLink = link.replace(/^(ftp|http|https):\/\//, '');
    cleanedLink = cleanedLink.replace(/\/+$/, '');
    cleanedLink = cleanedLink.replace(/\/[^/]*$/, '');
    return cleanedLink;
  };