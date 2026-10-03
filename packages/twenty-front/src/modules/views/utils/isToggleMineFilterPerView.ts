export const isToggleMineFilterPerView = (
  value: unknown,
): value is Record<string, boolean> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return false;
  }

  return Object.values(value).every(
    (isMineSelected) => typeof isMineSelected === 'boolean',
  );
};
