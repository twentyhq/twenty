import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { IconButton } from 'twenty-ui/components/input';
import { IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

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
  const theme = useTheme();

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    headerItemId,
  );

  const toggleLabel = isOpen ? t`Collapse ${heading}` : t`Expand ${heading}`;
  const ToggleIcon = isOpen ? IconChevronUp : IconChevronDown;

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
            tabIndex={-1}
            onClick={onToggle}
          >
            <ToggleIcon
              aria-hidden
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          </IconButton>
        </StyledToggle>
      </CommandMenuItemSectionHeading>
    </SelectableListItem>
  );
};
