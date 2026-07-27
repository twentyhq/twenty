// Always a new tab: a front component must not be able to navigate the Twenty
// tab away, which would let a trusted origin replace the app with a lookalike.
export const openExternalUrl = (url: string) => {
  window.open(url, '_blank', 'noopener,noreferrer');
};
