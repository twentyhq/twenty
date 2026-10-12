import { getChipLabel } from '@/ui/field/display/utils/getChipLabel';
import { LinkChip } from '@/ui/navigation/link/components/LinkChip/LinkChip';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

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
      <Chip variant="soft" startElement={target.leftComponent}>
        {getChipLabel(reference.displayName).content}
      </Chip>
    );
  }

  return (
    <LinkChip
      to={target.to}
      onClick={target.onClick}
      variant="soft"
      startElement={target.leftComponent}
    >
      {getChipLabel(reference.displayName).content}
    </LinkChip>
  );
};
