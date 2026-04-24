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
  totalPages: number;
  projects: Array<{
    owner: string;
    number: number;
    totalCount: number;
    pages: number;
  }>;
};

type FetchPageResponse = {
  itemCount: number;
  totalCount: number;
  hasMore: boolean;
  endCursor: string | null;
};

type SyncStatus = 'syncing' | 'done' | 'error';

const FetchProjectItems = () => {
  const [status, setStatus] = useState<SyncStatus>('syncing');

  useEffect(() => {
    const run = async () => {
      try {
        const counts = (await callAppRoute(
          '/github/count-project-items',
          {},
        )) as CountResponse;

        if (counts.projects.length === 0) {
          throw new Error(
            'No projects resolved. Set GITHUB_PROJECTS in the application variables (e.g. `twentyhq/24`).',
          );
        }

        const totalPages = Math.max(counts.totalPages, 1);
        let pagesProcessed = 0;
        let totalItems = 0;

        for (const { owner, number } of counts.projects) {
          let cursor: string | null = null;
          let hasMore = true;

          while (hasMore) {
            const data = (await callAppRoute('/github/fetch-project-items', {
              owner,
              number,
              cursor,
            })) as FetchPageResponse;

            totalItems += data.itemCount;
            hasMore = data.hasMore && data.itemCount > 0;
            cursor = data.endCursor;
            pagesProcessed++;

            updateProgress(Math.min(Math.round((pagesProcessed / totalPages) * 100), 99));
          }
        }

        updateProgress(100);
        enqueueSnackbar({
          message: `Fetched ${totalItems} project items`,
          variant: 'success',
        });
        setStatus('done');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Failed to fetch project items';
        enqueueSnackbar({ message, variant: 'error' });
        setStatus('error');
      } finally {
        unmountFrontComponent();
      }
    };
    run();
  }, []);

  if (status === 'syncing') return <div>Fetching project items...</div>;
  if (status === 'error') return <div>Failed to fetch project items.</div>;
  return <div>Done</div>;
};

export default defineFrontComponent({
  universalIdentifier: '7c397b0c-8b19-4fac-924a-8f6aa1dece78',
  name: 'Fetch Project Items',
  description: 'Fetches project items from GitHub Projects V2',
  isHeadless: true,
  component: FetchProjectItems,
  command: {
    universalIdentifier: '719cfe1c-d570-4c8c-89e6-88671c6ba1ea',
    label: 'Fetch Project Items',
    icon: 'IconLayoutKanban',
    isPinned: false,
    conditionalAvailabilityExpression:
      objectMetadataItem.nameSingular === 'projectItem',
  },
});
