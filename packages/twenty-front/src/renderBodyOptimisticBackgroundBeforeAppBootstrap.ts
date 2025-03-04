// TODO consume theme from twenty-ui after its migration as a package, at the moment the bunlde is too big
// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const THEME_LIGHT_BACKGROUND_TERTIARY = '#f1f1f1';
// eslint-disable-next-line @nx/workspace-no-hardcoded-colors
const THEME_DARK_BACKGROUND_TERTIARY = '#1d1d1d';

// TODO should search in local storage for user last session appearance preferences
const renderBodyOptimisticBackgroundBeforeAppBootstrap = () => {
  const isDarkTheme =
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (isDarkTheme) {
    document.body.style.background = THEME_DARK_BACKGROUND_TERTIARY;
  } else {
    document.body.style.background = THEME_LIGHT_BACKGROUND_TERTIARY;
  }
};
renderBodyOptimisticBackgroundBeforeAppBootstrap();
