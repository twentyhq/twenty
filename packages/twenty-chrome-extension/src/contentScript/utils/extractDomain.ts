const extractDomain = (url: string | null) => {
  if (!url) return '';

  const hostname = new URL(url).hostname;
  let domain = hostname.replace('www.', '');

  const parts = domain.split('.');
  if (parts.length > 2) {
    domain = parts.slice(1).join('.');
  }

  return domain;
};

export default extractDomain;
