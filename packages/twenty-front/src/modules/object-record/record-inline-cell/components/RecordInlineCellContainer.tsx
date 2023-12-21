import { useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useInlineCell } from '../hooks/useInlineCell';

import { RecordInlineCellDisplayMode } from './RecordInlineCellDisplayMode';
import { RecordInlineCellButton } from './RecordInlineCellEditButton';
import { RecordInlineCellEditMode } from './RecordInlineCellEditMode';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  width: 16px;

  svg {
    align-items: center;
    display: flex;
    height: 16px;
    justify-content: center;
    width: 16px;
  }
`;

const StyledLabelAndIconContainer = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledValueContainer = styled.div`
  display: flex;
`;

const StyledLabel = styled.div<
  Pick<RecordInlineCellContainerProps, 'labelFixedWidth'>
>`
  align-items: center;

  width: ${({ labelFixedWidth }) =>
    labelFixedWidth ? `${labelFixedWidth}px` : 'fit-content'};
`;

const StyledEditButtonContainer = styled(motion.div)`
  align-items: center;
  display: flex;
`;

const StyledClickableContainer = styled.div`
  cursor: pointer;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

const StyledInlineCellBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;

  display: flex;

  gap: ${({ theme }) => theme.spacing(1)};

  position: relative;
  user-select: none;
`;

type RecordInlineCellContainerProps = {
  IconLabel?: IconComponent;
  label?: string;
  labelFixedWidth?: number;
  buttonIcon?: IconComponent;
  editModeContent?: React.ReactNode;
  editModeContentOnly?: boolean;
  displayModeContent: React.ReactNode;
  customEditHotkeyScope?: HotkeyScope;
  isDisplayModeContentEmpty?: boolean;
  isDisplayModeFixHeight?: boolean;
  disableHoverEffect?: boolean;
};

export const RecordInlineCellContainer = ({
  IconLabel,
  label,
  labelFixedWidth,
  buttonIcon,
  editModeContent,
  displayModeContent,
  customEditHotkeyScope,
  isDisplayModeContentEmpty,
  editModeContentOnly,
  isDisplayModeFixHeight,
  disableHoverEffect,
}: RecordInlineCellContainerProps) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleContainerMouseEnter = () => {
    setIsHovered(true);
  };

  const handleContainerMouseLeave = () => {
    setIsHovered(false);
  };

  const { isInlineCellInEditMode, openInlineCell } = useInlineCell();

  const handleDisplayModeClick = () => {
    if (!editModeContentOnly) {
      openInlineCell(customEditHotkeyScope);
    }
  };

  const showEditButton =
    buttonIcon && !isInlineCellInEditMode && isHovered && !editModeContentOnly;

  const theme = useTheme();

  return (
    <StyledInlineCellBaseContainer
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(!!IconLabel || !!label) && (
        <StyledLabelAndIconContainer>
          {IconLabel && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {label && (
            <StyledLabel labelFixedWidth={labelFixedWidth}>{label}</StyledLabel>
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer>
        {isInlineCellInEditMode ? (
          <RecordInlineCellEditMode>{editModeContent}</RecordInlineCellEditMode>
        ) : editModeContentOnly ? (
          <StyledClickableContainer>
            <RecordInlineCellDisplayMode
              disableHoverEffect={disableHoverEffect}
              isDisplayModeContentEmpty={isDisplayModeContentEmpty}
              isDisplayModeFixHeight={isDisplayModeFixHeight}
              isHovered={isHovered}
            >
              {editModeContent}
            </RecordInlineCellDisplayMode>
          </StyledClickableContainer>
        ) : (
          <StyledClickableContainer onClick={handleDisplayModeClick}>
            <RecordInlineCellDisplayMode
              disableHoverEffect={disableHoverEffect}
              isDisplayModeContentEmpty={isDisplayModeContentEmpty}
              isDisplayModeFixHeight={isDisplayModeFixHeight}
              isHovered={isHovered}
            >
              {displayModeContent}
            </RecordInlineCellDisplayMode>
            {showEditButton && (
              <StyledEditButtonContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                whileHover={{ scale: 1.04 }}
              >
                <RecordInlineCellButton Icon={buttonIcon} />
              </StyledEditButtonContainer>
            )}
          </StyledClickableContainer>
        )}
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
