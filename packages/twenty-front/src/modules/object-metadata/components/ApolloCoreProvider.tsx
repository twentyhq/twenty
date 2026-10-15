import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { workflowRunStaleResponseLink } from '@/workflow/utils/workflowRunStaleResponseLink';

export const ApolloCoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const apolloCoreClient = useApolloFactory({
    extraLinks: [workflowRunStaleResponseLink],
  });

  return (
    <ApolloCoreClientContext.Provider value={apolloCoreClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};
