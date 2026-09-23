import { type ReactNode } from 'react';
import { Chip } from 'twenty-ui/primitives/data-display';

import { COMMAND_MENU_ITEM_SECTION_CONTEXT_CHIP_MAX_WIDTH } from '@/command-menu-item/display/constants/CommandMenuItemSectionContextChipMaxWidth';

type CommandMenuItemSectionContextChipProps = {
  startElement: ReactNode;
  label: string;
};

export const CommandMenuItemSectionContextChip = ({
  startElement,
  label,
}: CommandMenuItemSectionContextChipProps) => (
  <Chip
    size="sm"
    variant="soft"
    color="secondary"
    weight="medium"
    maxWidth={COMMAND_MENU_ITEM_SECTION_CONTEXT_CHIP_MAX_WIDTH}
    startElement={startElement}
  >
    {label}
  </Chip>
);
