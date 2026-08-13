import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';

const MatchMediaComponent = () => {
  const [matchResults, setMatchResults] = useState({
    minWidth: '',
    unknownQuery: '',
    lightColorScheme: '',
  });

  useEffect(() => {
    setMatchResults({
      minWidth: String(window.matchMedia('(min-width: 1px)').matches),
      unknownQuery: String(
        window.matchMedia('(orientation: portrait)').matches,
      ),
      lightColorScheme: String(
        window.matchMedia('(prefers-color-scheme: light)').matches,
      ),
    });
  }, []);

  return (
    <div
      data-testid="match-media-component"
      style={{ fontFamily: 'system-ui, sans-serif', padding: 16 }}
    >
      <p data-testid="match-media-min-width">
        min-width matches: {matchResults.minWidth}
      </p>
      <p data-testid="match-media-unknown-query">
        unknown query matches: {matchResults.unknownQuery}
      </p>
      <p data-testid="match-media-light-color-scheme">
        light color scheme matches: {matchResults.lightColorScheme}
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
