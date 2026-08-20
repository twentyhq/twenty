import { defineFrontComponent } from 'twenty-sdk/define';

const MatchMediaComponent = () => {
  const ownWidth = document.body.clientWidth;
  const ownHeight = document.body.clientHeight;

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
  const colorScheme = window.matchMedia('(prefers-color-scheme: dark)').matches
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
    </div>
  );
};

export default defineFrontComponent({
  universalIdentifier: 'fc-match-media-0000-0000-0000-000000000001',
  name: 'match-media-component',
  description: 'Front component evaluating media queries through matchMedia',
  component: MatchMediaComponent,
});
