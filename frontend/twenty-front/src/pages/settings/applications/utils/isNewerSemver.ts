// Returns true if versionA is strictly greater than versionB (major.minor.patch)
export const isNewerSemver = (versionA: string, versionB: string): boolean => {
  const partsA = versionA.split('.').map(Number);
  const partsB = versionB.split('.').map(Number);

  for (let i = 0; i < 3; i++) {
    const a = partsA[i] ?? 0;
    const b = partsB[i] ?? 0;

    if (a > b) return true;
    if (a < b) return false;
  }

  return false;
};
