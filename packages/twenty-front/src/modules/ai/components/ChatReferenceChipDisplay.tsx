import { t } from '@lingui/core/macro';
import { type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant, LinkChip } from 'twenty-ui/data-display';

import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';

type ChatReferenceChipDisplayProps = {
  displayName: string;
  leftComponent: ReactNode;
  to?: string;
};

export const ChatReferenceChipDisplay = ({
  displayName,
  leftComponent,
  to,
}: ChatReferenceChipDisplayProps) => {
  const isNavigationEnabled = useContext(ChatReferenceNavigationEnabledContext);

  if (!isDefined(to) || !isNavigationEnabled) {
    return (
      <Chip
        label={displayName}
        emptyLabel={t`Untitled`}
        variant={ChipVariant.Static}
        leftComponent={leftComponent}
        clickable={false}
      />
    );
  }

  return (
    <LinkChip
      label={displayName}
      emptyLabel={t`Untitled`}
      to={to}
      variant={ChipVariant.Highlighted}
      leftComponent={leftComponent}
    />
  );
};
