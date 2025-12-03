import { DUPLICATE_DASHBOARD } from '@/dashboards/graphql/mutations/duplicateDashboard';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useMutation } from '@apollo/client';

type DuplicateDashboardResult = {
  id: string;
  title: string | null;
  pageLayoutId: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
};

export const useDuplicateDashboard = () => {
  const apolloCoreClient = useApolloCoreClient();
  const [mutate] = useMutation<
    { duplicateDashboard: DuplicateDashboardResult },
    { id: string }
  >(DUPLICATE_DASHBOARD, {
    client: apolloCoreClient,
  });

  const duplicateDashboard = async (dashboardId: string) => {
    const result = await mutate({
      variables: { id: dashboardId },
    });

    return result?.data?.duplicateDashboard;
  };

  return {
    duplicateDashboard,
  };
};
