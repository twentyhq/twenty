import { useEffect, useState } from 'react';
import { defineFrontComponent } from 'twenty-sdk/define';
import {
  enqueueSnackbar,
  objectMetadataItem,
  unmountFrontComponent,
  updateProgress,
} from 'twenty-sdk/front-component';
import { callAppRoute } from 'src/modules/shared/call-app-route';

type CountResponse = {
  totalCount: number;
  totalPages: number;
  orgMembers: string[];
};

type FetchPageResponse = {
  contributorCount: number;
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type SyncStatus = 'syncing' | 'done' | 'error';

const FetchContributors = () => {
  const [status, setStatus] = useState<SyncStatus>('syncing');

  useEffect(() => {
    const run = async () => {
      try {
        const counts = (await callAppRoute('/github/count-contributors', {
          owner: 'twentyhq',
          repo: 'twenty',
        })) as CountResponse;

        const totalPages = Math.max(counts.totalPages, 1);
        let pagesProcessed = 0;
        let totalSynced = 0;
        let cursor: string | null = null;
        let hasMore = true;

        while (hasMore) {
          const data = (await callAppRoute('/github/fetch-contributors', {
            owner: 'twentyhq',
            repo: 'twenty',
            cursor,
            orgMembers: counts.orgMembers,
          })) as FetchPageResponse;

          totalSynced += data.contributorCount;
          hasMore = data.hasMore && data.contributorCount > 0;
          cursor = data.endCursor;
          pagesProcessed++;

          updateProgress(
            Math.min(Math.round((pagesProcessed / totalPages) * 100), 99),
          );
        }

        updateProgress(100);
        enqueueSnackbar({
          message: `Synced ${totalSynced} contributors`,
          variant: 'success',
        });
        setStatus('done');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch contributors';
        enqueueSnackbar({ message, variant: 'error' });
        setStatus('error');
      } finally {
        unmountFrontComponent();
      }
    };
    run();
  }, []);

  if (status === 'syncing') return <div>Fetching contributors...</div>;
  if (status === 'error') return <div>Failed to fetch contributors.</div>;
  return <div>Done</div>;
};

export default defineFrontComponent({
  universalIdentifier: '08f40f82-24ed-4f3e-8c99-695151e90e38',
  name: 'Fetch Contributors',
  description: 'Fetches all contributors of twentyhq/twenty and marks core team members',
  isHeadless: true,
  component: FetchContributors,
  command: {
    universalIdentifier: '4640992f-c2c9-4bba-b5df-9c8f05dc9e80',
    label: 'Fetch Contributors',
    icon: 'IconUsers',
    isPinned: false,
    conditionalAvailabilityExpression:
      objectMetadataItem.nameSingular === 'contributor',
  },
});
