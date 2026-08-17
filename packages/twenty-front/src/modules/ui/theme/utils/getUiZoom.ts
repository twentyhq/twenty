// Pointer coordinates arrive in visual-viewport pixels while layout runs in
// design pixels under the root zoom rule, so pointer deltas are divided by
// the effective zoom before entering stored sizes.
export const getUiZoom = (): number => {
  if (typeof document === 'undefined') {
    return 1;
  }

  const zoom = Number(getComputedStyle(document.documentElement).zoom);

  return Number.isFinite(zoom) && zoom > 0 ? zoom : 1;
};
