import { useStore } from 'jotai';

import { useApolloFactory } from '@/apollo/hooks/useApolloFactory';

import { ApolloCoreClientContext } from '@/object-metadata/contexts/ApolloCoreClientContext';
import { createSseStaleRecordGuardLink } from '@/sse-db-event/utils/createSseStaleRecordGuardLink';

export const ApolloCoreProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const store = useStore();

  const sseStaleRecordGuardLink = createSseStaleRecordGuardLink({ store });

  const apolloCoreClient = useApolloFactory({
    extraLinks: [sseStaleRecordGuardLink],
  });

  return (
    <ApolloCoreClientContext.Provider value={apolloCoreClient}>
      {children}
    </ApolloCoreClientContext.Provider>
  );
};
