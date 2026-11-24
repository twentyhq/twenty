import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { CommandMenuItemSectionHeading } from '@/command-menu-item/display/components/CommandMenuItemSectionHeading';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';

const StyledPreview = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledToggle = styled.span`
  display: inline-flex;
  flex: none;
  margin-left: auto;
`;

const StyledChevron = styled.span`
  display: inline-flex;
  transition: transform
    calc(${themeCssVariables.animation.duration.normal} * 1s) ease;

  &[data-opened='true'] {
    transform: rotate(180deg);
  }
`;

type CommandMenuItemCollapsibleSectionHeadingProps = {
  headerItemId: string;
  heading: string;
  isOpen: boolean;
  preview: string;
  onToggle: () => void;
  children: ReactNode;
};

export const CommandMenuItemCollapsibleSectionHeading = ({
  headerItemId,
  heading,
  isOpen,
  preview,
  onToggle,
  children,
}: CommandMenuItemCollapsibleSectionHeadingProps) => {
  const { t } = useLingui();

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    headerItemId,
  );

  const toggleLabel = isOpen ? t`Collapse ${heading}` : t`Expand ${heading}`;

  return (
    <SelectableListItem itemId={headerItemId} onEnter={onToggle}>
      <CommandMenuItemSectionHeading isActive={isSelectedItemId}>
        {children}
        {!isOpen && <StyledPreview>{preview}</StyledPreview>}
        <StyledToggle onMouseDown={(event) => event.preventDefault()}>
          <IconButton
            size="sm"
            variant="ghost"
            tooltip={toggleLabel}
            aria-label={toggleLabel}
            aria-expanded={isOpen}
            onClick={onToggle}
          >
            <StyledChevron aria-hidden data-opened={isOpen}>
              <IconChevronDown />
            </StyledChevron>
          </IconButton>
        </StyledToggle>
      </CommandMenuItemSectionHeading>
    </SelectableListItem>
  );
};
