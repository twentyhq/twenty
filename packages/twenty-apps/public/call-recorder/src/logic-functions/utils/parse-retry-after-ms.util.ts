export const parseRetryAfterMs = (
  retryAfterHeader: string | null,
  nowMs: number,
  maxRetryAfterMs: number,
): number | undefined => {
  if (retryAfterHeader === null) {
    return undefined;
  }

  const trimmedRetryAfterHeader = retryAfterHeader.trim();

  if (trimmedRetryAfterHeader.length === 0) {
    return undefined;
  }

  if (/^\d+$/.test(trimmedRetryAfterHeader)) {
    return Math.min(Number(trimmedRetryAfterHeader) * 1000, maxRetryAfterMs);
  }

  // Malformed numeric forms (1.5, 1e2, 0x10) would be misread as dates by Date.parse.
  if (!Number.isNaN(Number(trimmedRetryAfterHeader))) {
    return undefined;
  }

  const retryAfterDateMs = Date.parse(trimmedRetryAfterHeader);

  if (Number.isNaN(retryAfterDateMs)) {
    return undefined;
  }

  return Math.min(Math.max(0, retryAfterDateMs - nowMs), maxRetryAfterMs);
};
