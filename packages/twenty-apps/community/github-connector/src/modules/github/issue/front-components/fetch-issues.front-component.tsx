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
  issueCount: number;
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type SyncStatus = 'syncing' | 'done' | 'error';

const FetchIssues = () => {
  const [status, setStatus] = useState<SyncStatus>('syncing');

  useEffect(() => {
    const run = async () => {
      try {
        const counts = (await callAppRoute(
          '/github/count-issues',
          {},
        )) as CountResponse;

        if (counts.repos.length === 0) {
          throw new Error(
            'No repos resolved. Set GITHUB_REPOS in the application variables.',
          );
        }

        const totalPages = Math.max(counts.totalPages, 1);
        let pagesProcessed = 0;
        let totalIssues = 0;

        for (const { owner, repo } of counts.repos) {
          let cursor: string | null = null;
          let hasMore = true;

          while (hasMore) {
            const cursorTag = cursor ? `@${cursor.slice(0, 8)}` : '';
            const data = (await retry(
              `fetch-issues ${owner}/${repo}${cursorTag}`,
              () =>
                callAppRoute('/github/fetch-issues', {
                  owner,
                  repo,
                  cursor,
                }),
            )) as FetchPageResponse;

            totalIssues += data.issueCount;
            hasMore = data.hasMore && data.issueCount > 0;
            cursor = data.endCursor;
            pagesProcessed++;

            updateProgress(Math.min(Math.round((pagesProcessed / totalPages) * 100), 99));
          }
        }

        updateProgress(100);
        enqueueSnackbar({
          message: `Fetched ${totalIssues} issues`,
          variant: 'success',
        });
        setStatus('done');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch issues';
        enqueueSnackbar({ message, variant: 'error' });
        setStatus('error');
      } finally {
        unmountFrontComponent();
      }
    };
    run();
  }, []);

  if (status === 'syncing') return <div>Fetching issues...</div>;
  if (status === 'error') return <div>Failed to fetch issues.</div>;
  return <div>Done</div>;
};

export default defineFrontComponent({
  universalIdentifier: '9430e4fc-9ecb-428d-9bde-2babeb1f452f',
  name: 'Fetch Issues',
  description: 'Fetches issues from GitHub repos',
  isHeadless: true,
  component: FetchIssues,
  command: {
    universalIdentifier: 'c34f56aa-ff65-43a4-9db2-774945dbcc53',
    label: 'Fetch Issues',
    icon: 'IconBug',
    isPinned: false,
    conditionalAvailabilityExpression:
      objectMetadataItem.nameSingular === 'issue',
  },
});
