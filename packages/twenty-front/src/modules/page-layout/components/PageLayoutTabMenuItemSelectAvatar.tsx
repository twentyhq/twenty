import { styled } from '@linaria/react';
import { type MouseEvent, useContext, useState } from 'react';

import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { IconPencil } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import {
  StyledHoverableMenuItemBase,
  StyledMenuItemIconCheck,
  StyledMenuItemLabel,
  StyledMenuItemLeftContent,
} from 'twenty-ui/navigation';
import { themeCssVariables, ThemeContext } from 'twenty-ui/theme-constants';
const StyledTextContainer = styled.div`
  display: flex;
  align-items: center;
  flex: 1 0 0;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
`;

const StyledRightContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[1]};
`;

type PageLayoutTabMenuItemSelectAvatarProps = {
  tab: SingleTabProps;
  selected: boolean;
  onClick?: (event?: MouseEvent) => void;
  disabled?: boolean;
  showEditButton?: boolean;
  onEditClick?: (tabId: string) => void;
  testId?: string;
};

export const PageLayoutTabMenuItemSelectAvatar = ({
  tab,
  selected,
  onClick,
  disabled,
  showEditButton = false,
  onEditClick,
  testId,
}: PageLayoutTabMenuItemSelectAvatarProps) => {
  const { theme } = useContext(ThemeContext);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <StyledHoverableMenuItemBase
      onClick={onClick}
      disabled={disabled}
      data-testid={testId}
      role="option"
      aria-selected={selected}
      aria-disabled={disabled}
      isIconDisplayedOnHoverOnly={showEditButton}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <StyledMenuItemLeftContent>
        <TabAvatar tab={tab} />
        <StyledTextContainer>
          <StyledMenuItemLabel>{tab.title}</StyledMenuItemLabel>
        </StyledTextContainer>
      </StyledMenuItemLeftContent>

      <StyledRightContent>
        {selected && !isHovered && (
          <StyledMenuItemIconCheck size={theme.icon.size.md} />
        )}

        {isHovered && showEditButton && (
          <div className="hoverable-buttons">
            <LightIconButton
              Icon={IconPencil}
              size="small"
              accent="tertiary"
              onClick={() => onEditClick?.(tab.id)}
            />
          </div>
        )}
      </StyledRightContent>
    </StyledHoverableMenuItemBase>
  );
};
