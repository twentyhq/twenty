import { defineFrontComponent } from 'twenty-sdk/define';
import { useEffect, useState } from 'react';

const DARK_COLOR_SCHEME_QUERY = '(prefers-color-scheme: dark)';
const WIDE_WIDTH_QUERY = '(min-width: 600px)';
const PORTRAIT_ORIENTATION_QUERY = '(orientation: portrait)';
const MEASUREMENT_INTERVAL_MS = 50;

const readOwnBoxSize = () => ({
  width: document.body.clientWidth,
  height: document.body.clientHeight,
});

const useMediaQueryChangeCount = (mediaQuery: string) => {
  const [changeCount, setChangeCount] = useState(0);

  useEffect(() => {
    const mediaQueryList = window.matchMedia(mediaQuery);
    const handleChange = () => {
      setChangeCount((count) => count + 1);
    };

    mediaQueryList.addEventListener('change', handleChange);

    return () => {
      mediaQueryList.removeEventListener('change', handleChange);
    };
  }, [mediaQuery]);

  return changeCount;
};

const MatchMediaComponent = () => {
  const colorSchemeChangeCount = useMediaQueryChangeCount(
    DARK_COLOR_SCHEME_QUERY,
  );
  const wideWidthChangeCount = useMediaQueryChangeCount(WIDE_WIDTH_QUERY);
  const portraitOrientationChangeCount = useMediaQueryChangeCount(
    PORTRAIT_ORIENTATION_QUERY,
  );
  const [ownBoxSize, setOwnBoxSize] = useState(readOwnBoxSize);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextBoxSize = readOwnBoxSize();

      setOwnBoxSize((currentBoxSize) =>
        currentBoxSize.width === nextBoxSize.width &&
        currentBoxSize.height === nextBoxSize.height
          ? currentBoxSize
          : nextBoxSize,
      );
    }, MEASUREMENT_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, []);

  const { width: ownWidth, height: ownHeight } = ownBoxSize;

  const ownWidthMatches = String(
    window.matchMedia(`(min-width: ${ownWidth}px)`).matches,
  );
  const widerThanOwnWidthMatches = String(
    window.matchMedia(`(min-width: ${ownWidth + 1}px)`).matches,
  );
  const unknownQueryMatches = String(
    window.matchMedia('(hover: hover)').matches,
  );
  const emptyQueryInListMatches = String(
    window.matchMedia(`(min-width: ${ownWidth + 1}px),`).matches,
  );
  const colorScheme = window.matchMedia(DARK_COLOR_SCHEME_QUERY).matches
    ? 'dark'
    : 'light';
  const expectedOrientation = ownHeight >= ownWidth ? 'portrait' : 'landscape';
  const orientationMatches = String(
    window.matchMedia(`(orientation: ${expectedOrientation})`).matches,
  );

  return (
    <div
      data-testid="match-media-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <p data-testid="match-media-own-width-value">own width: {ownWidth}</p>
      <p data-testid="match-media-own-height-value">own height: {ownHeight}</p>
      <p data-testid="match-media-own-width">
        own width matches: {ownWidthMatches}
      </p>
      <p data-testid="match-media-wider-than-own-width">
        wider than own width matches: {widerThanOwnWidthMatches}
      </p>
      <p data-testid="match-media-unknown-query">
        unknown query matches: {unknownQueryMatches}
      </p>
      <p data-testid="match-media-empty-query-in-list">
        empty query in list matches: {emptyQueryInListMatches}
      </p>
      <p data-testid="match-media-orientation">
        orientation matches: {orientationMatches}
      </p>
      <p data-testid="match-media-color-scheme">color scheme: {colorScheme}</p>
      <p data-testid="match-media-color-scheme-change-count">
        color scheme changes: {colorSchemeChangeCount}
      </p>
      <p data-testid="match-media-wide-width-change-count">
        wide width changes: {wideWidthChangeCount}
      </p>
      <p data-testid="match-media-portrait-orientation-change-count">
        portrait orientation changes: {portraitOrientationChangeCount}
      </p>
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-match-media-0000-0000-0000-000000000001',
  name: 'match-media-component',
  description: 'Front component evaluating media queries through matchMedia',
  component: MatchMediaComponent,
});
