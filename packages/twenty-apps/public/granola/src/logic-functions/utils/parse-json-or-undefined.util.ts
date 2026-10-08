export const parseJsonOrUndefined = (rawBody: string): unknown => {
  try {
    return JSON.parse(rawBody);
  } catch {
    return undefined;
  }
};
