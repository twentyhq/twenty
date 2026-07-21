const IPV4_REGEX = /^(\d{1,3}\.){3}\d{1,3}$/;

export const deriveRemoteName = (url: string): string => {
  try {
    const { hostname } = new URL(url);

    if (IPV4_REGEX.test(hostname)) {
      return hostname.replace(/\./g, '-');
    }

    const labels = hostname.split('.');

    if (labels.length > 2) {
      return labels.slice(0, -2).join('-');
    }

    if (labels.length === 2) {
      return labels[0];
    }

    return labels.join('-');
  } catch {
    return 'remote';
  }
};
