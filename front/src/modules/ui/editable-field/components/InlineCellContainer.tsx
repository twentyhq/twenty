import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { IconComponent } from '@/ui/icon/types/IconComponent';
import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useInlineCell } from '../hooks/useInlineCell';

import { InlineCellDisplayMode } from './InlineCellDisplayMode';
import { InlineCellEditButton } from './InlineCellEditButton';
import { InlineCellEditMode } from './InlineCellEditMode';

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
  max-width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledLabel = styled.div<Pick<OwnProps, 'labelFixedWidth'>>`
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

  width: 100%;
`;

type OwnProps = {
  IconLabel?: IconComponent;
  label?: string;
  labelFixedWidth?: number;
  useEditButton?: boolean;
  editModeContent?: React.ReactNode;
  editModeContentOnly?: boolean;
  displayModeContent: React.ReactNode;
  customEditHotkeyScope?: HotkeyScope;
  isDisplayModeContentEmpty?: boolean;
  isDisplayModeFixHeight?: boolean;
  disableHoverEffect?: boolean;
};

export const InlineCellContainer = ({
  IconLabel,
  label,
  labelFixedWidth,
  useEditButton,
  editModeContent,
  displayModeContent,
  customEditHotkeyScope,
  isDisplayModeContentEmpty,
  editModeContentOnly,
  isDisplayModeFixHeight,
  disableHoverEffect,
}: OwnProps) => {
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
    !isInlineCellInEditMode &&
    isHovered &&
    useEditButton &&
    !editModeContentOnly;

  return (
    <StyledInlineCellBaseContainer
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <StyledLabelAndIconContainer>
        {IconLabel && (
          <StyledIconContainer>
            <IconLabel />
          </StyledIconContainer>
        )}
        {label && (
          <StyledLabel labelFixedWidth={labelFixedWidth}>{label}</StyledLabel>
        )}
      </StyledLabelAndIconContainer>
      <StyledValueContainer>
        {isInlineCellInEditMode ? (
          <InlineCellEditMode>{editModeContent}</InlineCellEditMode>
        ) : editModeContentOnly ? (
          <StyledClickableContainer>
            <InlineCellDisplayMode
              disableHoverEffect={disableHoverEffect}
              isDisplayModeContentEmpty={isDisplayModeContentEmpty}
              isDisplayModeFixHeight={isDisplayModeFixHeight}
              isHovered={isHovered}
            >
              {editModeContent}
            </InlineCellDisplayMode>
          </StyledClickableContainer>
        ) : (
          <StyledClickableContainer onClick={handleDisplayModeClick}>
            <InlineCellDisplayMode
              disableHoverEffect={disableHoverEffect}
              isDisplayModeContentEmpty={isDisplayModeContentEmpty}
              isDisplayModeFixHeight={isDisplayModeFixHeight}
              isHovered={isHovered}
            >
              {displayModeContent}
            </InlineCellDisplayMode>
            {showEditButton && (
              <StyledEditButtonContainer
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.1 }}
                whileHover={{ scale: 1.04 }}
              >
                <InlineCellEditButton />
              </StyledEditButtonContainer>
            )}
          </StyledClickableContainer>
        )}
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};
