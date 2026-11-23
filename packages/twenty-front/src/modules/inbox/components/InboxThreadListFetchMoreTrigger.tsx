import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

import { useLoadInboxThreadList } from '@/inbox/hooks/useLoadInboxThreadList';
import { inboxThreadListFamilyState } from '@/inbox/states/inboxThreadListFamilyState';
import { type InboxThreadListSource } from '@/inbox/types/InboxThreadListSource';
import { getInboxThreadListSourceKey } from '@/inbox/utils/getInboxThreadListSourceKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledFetchMoreTrigger = styled.div`
  height: 1px;
  min-height: 1px;
  width: 100%;
`;

type InboxThreadListFetchMoreTriggerProps = {
  source: InboxThreadListSource;
};

export const InboxThreadListFetchMoreTrigger = ({
  source,
}: InboxThreadListFetchMoreTriggerProps) => {
  const inboxThreadList = useAtomFamilyStateValue(
    inboxThreadListFamilyState,
    getInboxThreadListSourceKey(source),
  );
  const { loadInboxThreadList } = useLoadInboxThreadList();
  const { ref } = useInView({
    onChange: (inView) => {
      if (inView) {
        void loadInboxThreadList({ source, mode: 'fetch-more' });
      }
    },
  });

  if (!inboxThreadList?.hasNextPage) {
    return null;
  }

  return <StyledFetchMoreTrigger ref={ref} />;
};
