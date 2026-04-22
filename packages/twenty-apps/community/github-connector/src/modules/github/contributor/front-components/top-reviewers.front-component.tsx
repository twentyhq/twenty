import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import { enqueueSnackbar } from 'twenty-sdk/front-component';
import {
  Leaderboard,
  type LeaderboardEntry,
} from 'src/modules/github/contributor/components/leaderboard';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type Response = {
  topReviewers: LeaderboardEntry[];
};

const TopReviewers = () => {
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
          kind: 'reviewers',
        })) as Response;
        if (!cancelled) setEntries(res.topReviewers ?? []);
      } catch (err) {
        if (!cancelled) {
          const message =
            err instanceof Error ? err.message : 'Failed to load top reviewers';
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
      countColumnLabel="Reviews"
      entries={entries}
      loading={loading}
      error={error}
    />
  );
};

export const TOP_REVIEWERS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  'b2e5f8a3-ac4d-4f9b-8032-6e7d9bac3f4a';

export default defineFrontComponent({
  universalIdentifier: TOP_REVIEWERS_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER,
  name: 'Top Reviewers',
  description: 'Leaderboard of the top 20 pull-request reviewers over the last 90 days.',
  component: TopReviewers,
});
