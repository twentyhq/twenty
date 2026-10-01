// Pointer coordinates are in visual-viewport pixels while layout uses design pixels under the root zoom
export const getUiZoom = (): number => {
  if (typeof document === 'undefined') {
    return 1;
  }

  const zoom = Number(getComputedStyle(document.documentElement).zoom);

  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
};
