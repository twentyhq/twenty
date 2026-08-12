const LIST_MARKER_PATTERN = /^[ \t]*(?:[-*•]|\d+[.)])[ \t]+/m;

export const getSlackFirstListMarkerIndex = (
  responseText: string,
): number | undefined => {
  const match = responseText.match(LIST_MARKER_PATTERN);

  return match?.index;
};
