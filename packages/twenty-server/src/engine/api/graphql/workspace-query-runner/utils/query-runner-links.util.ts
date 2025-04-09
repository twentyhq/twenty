export const lowercaseDomain = (url: string) => {
  try {
    return new URL(url).toString();
  } catch {
    return url;
  }
};
