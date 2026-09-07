import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant, LinkChip } from 'twenty-ui/data-display';

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
        label={reference.displayName}
        emptyLabel={t`Untitled`}
        variant={ChipVariant.Static}
        leftComponent={target.leftComponent}
        clickable={false}
      />
    );
  }

  return (
    <LinkChip
      label={reference.displayName}
      emptyLabel={t`Untitled`}
      to={target.to}
      onClick={target.onClick}
      variant={ChipVariant.Highlighted}
      leftComponent={target.leftComponent}
    />
  );
};
