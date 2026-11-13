import { styled } from '@linaria/react';
import { useInView } from 'react-intersection-observer';

import { useLoadInboxThreadList } from '@/ai/hooks/useLoadInboxThreadList';
import { inboxThreadListFamilyState } from '@/ai/states/inboxThreadListFamilyState';
import { type InboxThreadListSource } from '@/ai/types/InboxThreadListSource';
import { getInboxThreadListSourceKey } from '@/ai/utils/getInboxThreadListSourceKey';
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
