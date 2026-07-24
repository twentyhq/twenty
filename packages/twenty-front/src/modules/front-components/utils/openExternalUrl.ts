export const openExternalUrl = (url: string, target?: string) => {
  if (target === '_blank') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  window.open(url, '_self');
};
