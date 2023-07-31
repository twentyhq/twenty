import { useState } from 'react';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';

import { HotkeyScope } from '@/ui/utilities/hotkey/types/HotkeyScope';

import { useBindFieldHotkeyScope } from '../hooks/useBindFieldHotkeyScope';
import { useEditableField } from '../hooks/useEditableField';

import { EditableFieldDisplayMode } from './EditableFieldDisplayMode';
import { EditableFieldEditButton } from './EditableFieldEditButton';
import { EditableFieldEditMode } from './EditableFieldEditMode';

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
  flex: 1;
  max-width: calc(100% - ${({ theme }) => theme.spacing(4)});
`;

const StyledLabel = styled.div<Pick<OwnProps, 'labelFixedWidth'>>`
  align-items: center;

  width: ${({ labelFixedWidth }) =>
    labelFixedWidth ? `${labelFixedWidth}px` : 'fit-content'};
`;

const StyledEditButtonContainer = styled(motion.div)`
  position: absolute;
  right: 0;
`;

export const EditableFieldBaseContainer = styled.div`
  align-items: center;
  box-sizing: border-box;

  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};

  justify-content: space-between;
  position: relative;

  user-select: none;
  width: 100%;
`;

type OwnProps = {
  iconLabel?: React.ReactNode;
  label?: string;
  labelFixedWidth?: number;
  useEditButton?: boolean;
  editModeContent?: React.ReactNode;
  displayModeContentOnly?: boolean;
  disableHoverEffect?: boolean;
  displayModeContent: React.ReactNode;
  parentHotkeyScope?: HotkeyScope;
  customEditHotkeyScope?: HotkeyScope;
  isDisplayModeContentEmpty?: boolean;
  isDisplayModeFixHeight?: boolean;
  onSubmit?: () => void;
  onCancel?: () => void;
};

export function EditableField({
  iconLabel,
  label,
  labelFixedWidth,
  useEditButton,
  editModeContent,
  displayModeContent,
  parentHotkeyScope,
  customEditHotkeyScope,
  disableHoverEffect,
  isDisplayModeContentEmpty,
  displayModeContentOnly,
  isDisplayModeFixHeight,
  onSubmit,
  onCancel,
}: OwnProps) {
  const [isHovered, setIsHovered] = useState(false);

  useBindFieldHotkeyScope({
    customEditHotkeyScope,
    parentHotkeyScope,
  });

  function handleContainerMouseEnter() {
    setIsHovered(true);
  }

  function handleContainerMouseLeave() {
    setIsHovered(false);
  }

  const { isFieldInEditMode, openEditableField } = useEditableField();

  function handleDisplayModeClick() {
    openEditableField();
  }

  const showEditButton = !isFieldInEditMode && isHovered && useEditButton;

  return (
    <EditableFieldBaseContainer
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      <StyledLabelAndIconContainer>
        {iconLabel && <StyledIconContainer>{iconLabel}</StyledIconContainer>}
        {label && (
          <StyledLabel labelFixedWidth={labelFixedWidth}>{label}</StyledLabel>
        )}
      </StyledLabelAndIconContainer>
      <StyledValueContainer>
        {isFieldInEditMode && !displayModeContentOnly ? (
          <EditableFieldEditMode onSubmit={onSubmit} onCancel={onCancel}>
            {editModeContent}
          </EditableFieldEditMode>
        ) : (
          <EditableFieldDisplayMode
            disableHoverEffect={disableHoverEffect}
            disableClick={useEditButton}
            onClick={handleDisplayModeClick}
            isDisplayModeContentEmpty={isDisplayModeContentEmpty}
            isDisplayModeFixHeight={isDisplayModeFixHeight}
          >
            {displayModeContent}
          </EditableFieldDisplayMode>
        )}
      </StyledValueContainer>
      {showEditButton && (
        <StyledEditButtonContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.1 }}
          whileHover={{ scale: 1.04 }}
        >
          <EditableFieldEditButton />
        </StyledEditButtonContainer>
      )}
    </EditableFieldBaseContainer>
  );
}
