export const computeUpdatedNavigationMemorizedUrlAfterObjectNamePluralChange = (
  navigationMemorizedUrl: string,
  previousObjectNamePlural: string,
  updatedObjectNamePlural: string,
): string => {
  const objectRoutePatternWithPreviousNamePlural = `^/objects/${previousObjectNamePlural}`;
  const objectRouteRegexMatchingPreviousNamePlural = new RegExp(
    `${objectRoutePatternWithPreviousNamePlural}(/|\\?|$)`,
  );

  const isNavigationMemorizedUrlMatchingPreviousObjectRoute =
    objectRouteRegexMatchingPreviousNamePlural.test(navigationMemorizedUrl);

  if (!isNavigationMemorizedUrlMatchingPreviousObjectRoute) {
    return navigationMemorizedUrl;
  }

  const navigationMemorizedUrlWithUpdatedObjectNamePlural =
    navigationMemorizedUrl.replace(
      new RegExp(objectRoutePatternWithPreviousNamePlural),
      `/objects/${updatedObjectNamePlural}`,
    );

  return navigationMemorizedUrlWithUpdatedObjectNamePlural;
};
