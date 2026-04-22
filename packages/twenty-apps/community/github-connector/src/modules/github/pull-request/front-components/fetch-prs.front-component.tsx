import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  objectMetadataItem,
  unmountFrontComponent,
  updateProgress,
} from 'twenty-sdk/front-component';
import { callAppRoute } from 'src/modules/shared/call-app-route';
import { retry } from 'src/modules/shared/retry';

type CountResponse = {
  totalPages: number;
  repos: Array<{ owner: string; repo: string; totalCount: number; pages: number }>;
};

type FetchPageResponse = {
  prCount: number;
  reviewCount: number;
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type SyncStatus = 'syncing' | 'done' | 'error';

const FetchPrs = () => {
  const [status, setStatus] = useState<SyncStatus>('syncing');

  useEffect(() => {
    const run = async () => {
      try {
        const counts = (await callAppRoute(
          '/github/count-prs',
          {},
        )) as CountResponse;

        if (counts.repos.length === 0) {
          throw new Error(
            'No repos resolved. Set GITHUB_REPOS in the application variables.',
          );
        }

        const totalPages = Math.max(counts.totalPages, 1);
        let pagesProcessed = 0;
        let totalPrs = 0;
        let totalReviews = 0;

        for (const { owner, repo } of counts.repos) {
          let cursor: string | null = null;
          let hasMore = true;

          while (hasMore) {
            const cursorTag = cursor ? `@${cursor.slice(0, 8)}` : '';
            const data = (await retry(
              `fetch-prs ${owner}/${repo}${cursorTag}`,
              () =>
                callAppRoute('/github/fetch-prs', {
                  owner,
                  repo,
                  cursor,
                }),
            )) as FetchPageResponse;

            totalPrs += data.prCount;
            totalReviews += data.reviewCount;
            hasMore = data.hasMore && data.prCount > 0;
            cursor = data.endCursor;
            pagesProcessed++;

            updateProgress(Math.min(Math.round((pagesProcessed / totalPages) * 100), 99));
          }
        }

        updateProgress(100);
        enqueueSnackbar({
          message: `Fetched ${totalPrs} PRs and ${totalReviews} reviews`,
          variant: 'success',
        });
        setStatus('done');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch pull requests';
        enqueueSnackbar({ message, variant: 'error' });
        setStatus('error');
      } finally {
        unmountFrontComponent();
      }
    };
    run();
  }, []);

  if (status === 'syncing') return <div>Fetching pull requests...</div>;
  if (status === 'error') return <div>Failed to fetch pull requests.</div>;
  return <div>Done</div>;
};

export default defineFrontComponent({
  universalIdentifier: '5e2ba8df-1db5-4964-94d3-44cccfd791a0',
  name: 'Fetch Pull Requests',
  description: 'Fetches pull requests and reviews from GitHub repos',
  isHeadless: true,
  component: FetchPrs,
  command: {
    universalIdentifier: '0b24e6d6-da0c-4c0e-8d88-5bfd7f3cd75a',
    label: 'Fetch Pull Requests',
    icon: 'IconGitPullRequest',
    isPinned: false,
    conditionalAvailabilityExpression:
      objectMetadataItem.nameSingular === 'pullRequest',
  },
});
