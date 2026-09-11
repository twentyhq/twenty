import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip, LinkChip } from 'twenty-ui/data-display';

import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';
import { useChatReferenceTarget } from '@/ai/hooks/useChatReferenceTarget';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';

type ChatReferenceChipProps = {
  reference: ChatReferenceMatch;
};

export const ChatReferenceChip = ({ reference }: ChatReferenceChipProps) => {
  const isNavigationEnabled = useContext(ChatReferenceNavigationEnabledContext);
  const target = useChatReferenceTarget(reference);

  if (!isDefined(target)) {
    return <span>{reference.displayName}</span>;
  }

  if (!isDefined(target.to) || !isNavigationEnabled) {
    return (
      <Chip
        emptyLabel={t`Untitled`}
        variant="soft"
        startElement={target.leftComponent}
        clickable={false}
      >
        {reference.displayName}
      </Chip>
    );
  }

  return (
    <LinkChip
      emptyLabel={t`Untitled`}
      to={target.to}
      onClick={target.onClick}
      variant="soft"
      startElement={target.leftComponent}
    >
      {reference.displayName}
    </LinkChip>
  );
};
