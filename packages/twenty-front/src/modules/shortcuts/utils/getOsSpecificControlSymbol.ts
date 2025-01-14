export const getOsSpecificControlSymbol = () => {
  const isMac =
    navigator?.userAgent?.toLowerCase().includes('mac os x') ||
    navigator?.userAgent?.toLowerCase().includes('macos');

  return isMac ? '⌘' : 'Ctrl';
};
