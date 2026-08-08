import { t } from '@lingui/core/macro';
import { type MouseEvent, type ReactNode, useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant, LinkChip } from 'twenty-ui/data-display';

import { ChatReferenceNavigationEnabledContext } from '@/ai/contexts/ChatReferenceNavigationEnabledContext';

type ChatReferenceChipDisplayProps = {
  displayName: string;
  leftComponent: ReactNode;
  to?: string;
  // When provided, a plain click runs it instead of navigating to `to`;
  // modifier-clicks still open `to` in a new tab.
  onClick?: (event: MouseEvent<HTMLElement>) => void;
};

export const ChatReferenceChipDisplay = ({
  displayName,
  leftComponent,
  to,
  onClick,
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
      onClick={onClick}
      variant={ChipVariant.Highlighted}
      leftComponent={leftComponent}
    />
  );
};
