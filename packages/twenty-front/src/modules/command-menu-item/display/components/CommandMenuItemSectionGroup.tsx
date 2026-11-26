import { styled } from '@linaria/react';
import React, { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/icon';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { CommandMenuItemCollapsibleSectionHeading } from '@/command-menu-item/display/components/CommandMenuItemCollapsibleSectionHeading';
import { CommandMenuItemSectionHeading } from '@/command-menu-item/display/components/CommandMenuItemSectionHeading';
import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { useLingui } from '@lingui/react/macro';

const StyledSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};

  & + & {
    margin-top: ${themeCssVariables.spacing[3]};
  }
`;

// Same width as a command's icon tile, so headings line up with command labels.
const StyledHeadingIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};
`;

const StyledHeadingText = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  min-width: 0;
`;

// Keyboard navigation scrolls the selected command into view, so the first
// command reserves room for its section header above it.
const StyledGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[0.5]};

  & > :first-child {
    scroll-margin-top: ${themeCssVariables.spacing[12]};
  }
`;

type CommandMenuItemSectionGroupCollapsible = {
  headerItemId: string;
  isOpen: boolean;
  preview: string;
  onToggle: () => void;
};

type CommandMenuItemSectionGroupProps = {
  heading: string;
  Icon?: IconComponent;
  context?: CommandMenuItemSectionContext;
  collapsible?: CommandMenuItemSectionGroupCollapsible;
  children: ReactNode;
};

export const CommandMenuItemSectionGroup = ({
  heading,
  Icon,
  context,
  collapsible,
  children,
}: CommandMenuItemSectionGroupProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  if (!isDefined(children) || !React.Children.count(children)) {
    return null;
  }

  const contextLabel = context?.label;

  const headingContent = (
    <>
      {isDefined(context?.icon) ? (
        <StyledHeadingIcon>{context.icon}</StyledHeadingIcon>
      ) : (
        isDefined(Icon) && (
          <StyledHeadingIcon>
            <Icon size={theme.icon.size.md} />
          </StyledHeadingIcon>
        )
      )}
      <StyledHeadingText>
        <OverflowingTextWithTooltip
          text={
            isDefined(contextLabel) ? t`${heading}: ${contextLabel}` : heading
          }
        />
      </StyledHeadingText>
    </>
  );

  const isOpen = collapsible?.isOpen ?? true;

  return (
    <StyledSection>
      {isDefined(collapsible) ? (
        <CommandMenuItemCollapsibleSectionHeading
          headerItemId={collapsible.headerItemId}
          heading={heading}
          isOpen={collapsible.isOpen}
          preview={collapsible.preview}
          onToggle={collapsible.onToggle}
        >
          {headingContent}
        </CommandMenuItemCollapsibleSectionHeading>
      ) : (
        <CommandMenuItemSectionHeading>
          {headingContent}
        </CommandMenuItemSectionHeading>
      )}
      {isOpen && <StyledGroup>{children}</StyledGroup>}
    </StyledSection>
  );
};
