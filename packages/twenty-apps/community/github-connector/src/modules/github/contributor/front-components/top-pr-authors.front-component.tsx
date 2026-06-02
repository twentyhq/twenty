import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import {
  Leaderboard,
  type LeaderboardEntry,
} from 'src/modules/github/contributor/components/leaderboard';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type Response = {
  topAuthors: LeaderboardEntry[];
};

const TopPRAuthors = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const res = (await callAppRoute('/contributors/top', {
          days: 90,
          limit: 20,
          kind: 'authors',
        })) as Response;
        if (!cancelled) setEntries(res.topAuthors ?? []);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load top authors';
          setError(message);
          enqueueSnackbar({ message, variant: 'error' });
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <Leaderboard
      contributorColumnLabel="Contributor"
      countColumnLabel="PRs"
      entries={entries}
      loading={loading}
      error={error}
    />
  );
};

export const TOP_PR_AUTHORS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'a1d4f7e2-9b3c-4e8a-bf21-5d6c8a9b2e3f';

export default defineFrontComponent({
  universalIdentifier: TOP_PR_AUTHORS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Top PR Authors',
  description: 'Leaderboard of the top 20 pull-request authors over the last 90 days.',
  component: TopPRAuthors,
});
