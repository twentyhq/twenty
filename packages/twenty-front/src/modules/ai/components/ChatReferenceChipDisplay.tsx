import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant, LinkChip } from 'twenty-ui/data-display';

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
  if (!isDefined(to)) {
    return (
      <Chip
        label={displayName}
        emptyLabel={t`Untitled`}
        variant={ChipVariant.Highlighted}
        leftComponent={leftComponent}
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
