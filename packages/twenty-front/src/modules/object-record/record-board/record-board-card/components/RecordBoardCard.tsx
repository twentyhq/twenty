import { ReactNode, useContext, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import styled from '@emotion/styled';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { EntityChipVariant, IconEye } from 'twenty-ui';

import { RecordChip } from '@/object-record/components/RecordChip';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Checkbox, CheckboxVariant } from '@/ui/input/components/Checkbox';
import { contextMenuIsOpenState } from '@/ui/navigation/context-menu/states/contextMenuIsOpenState';
import { contextMenuPositionState } from '@/ui/navigation/context-menu/states/contextMenuPositionState';
import { AnimatedEaseInOut } from '@/ui/utilities/animation/components/AnimatedEaseInOut';
import { ScrollWrapperContext } from '@/ui/utilities/scroll/components/ScrollWrapper';

const StyledBoardCard = styled.div<{ selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.accent.quaternary : theme.background.secondary};
  border: 1px solid
    ${({ theme, selected }) =>
      selected ? theme.accent.secondary : theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  box-shadow: ${({ theme }) => theme.boxShadow.light};
  color: ${({ theme }) => theme.font.color.primary};
  &:hover {
    background-color: ${({ theme, selected }) =>
      selected && theme.accent.tertiary};
    border: 1px solid
      ${({ theme, selected }) =>
        selected ? theme.accent.primary : theme.border.color.medium};
  }
  cursor: pointer;

  .checkbox-container {
    transition: all ease-in-out 160ms;
    opacity: ${({ selected }) => (selected ? 1 : 0)};
  }

  &:hover .checkbox-container {
    opacity: 1;
  }

  .compact-icon-container {
    transition: all ease-in-out 160ms;
    opacity: 0;
  }
  &:hover .compact-icon-container {
    opacity: 1;
  }
`;

const StyledBoardCardWrapper = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

export const StyledBoardCardHeader = styled.div<{
  showCompactView: boolean;
}>`
  align-items: center;
  display: flex;
  flex-direction: row;
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 24px;
  padding-bottom: ${({ theme, showCompactView }) =>
    theme.spacing(showCompactView ? 0 : 1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  transition: padding ease-in-out 160ms;

  img {
    height: ${({ theme }) => theme.icon.size.md}px;
    margin-right: ${({ theme }) => theme.spacing(2)};
    object-fit: cover;
    width: ${({ theme }) => theme.icon.size.md}px;
  }
`;

export const StyledBoardCardBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(0.5)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2.5)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  span {
    align-items: center;
    display: flex;
    flex-direction: row;
    svg {
      color: ${({ theme }) => theme.font.color.tertiary};
      margin-right: ${({ theme }) => theme.spacing(2)};
    }
  }
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  flex: 1;
  justify-content: end;
`;

const StyledFieldContainer = styled.div`
  display: flex;
  flex-direction: row;
  width: fit-content;
`;

const StyledCompactIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledRecordInlineCellPlaceholder = styled.div`
  height: 24px;
`;

export const RecordBoardCard = () => {
  const { recordId } = useContext(RecordBoardCardContext);
  const { updateOneRecord, objectMetadataItem } =
    useContext(RecordBoardContext);
  const {
    isCompactModeActiveState,
    isRecordBoardCardSelectedFamilyState,
    visibleFieldDefinitionsState,
  } = useRecordBoardStates();

  const isCompactModeActive = useRecoilValue(isCompactModeActiveState);

  const [isCardInCompactMode, setIsCardInCompactMode] = useState(true);

  const [isCurrentCardSelected, setIsCurrentCardSelected] = useRecoilState(
    isRecordBoardCardSelectedFamilyState(recordId),
  );

  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
  );

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const setContextMenuPosition = useSetRecoilState(contextMenuPositionState);
  const setContextMenuOpenState = useSetRecoilState(contextMenuIsOpenState);

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCurrentCardSelected(true);
    setContextMenuPosition({
      x: event.clientX,
      y: event.clientY,
    });
    setContextMenuOpenState(true);
  };

  const PreventSelectOnClickContainer = ({
    children,
  }: {
    children: ReactNode;
  }) => (
    <StyledFieldContainer
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {children}
    </StyledFieldContainer>
  );

  const onMouseLeaveBoard = () => {
    if (isCompactModeActive) {
      setIsCardInCompactMode(true);
    }
  };

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const scrollWrapperRef = useContext(ScrollWrapperContext);

  const { ref: cardRef, inView } = useInView({
    root: scrollWrapperRef.current,
    rootMargin: '1000px',
  });

  if (!record) {
    return null;
  }

  return (
    <StyledBoardCardWrapper onContextMenu={handleContextMenu}>
      <RecordValueSetterEffect recordId={recordId} />
      <StyledBoardCard
        ref={cardRef}
        selected={isCurrentCardSelected}
        onMouseLeave={onMouseLeaveBoard}
        onClick={() => {
          setIsCurrentCardSelected(!isCurrentCardSelected);
        }}
      >
        <StyledBoardCardHeader showCompactView={isCompactModeActive}>
          <RecordChip
            objectNameSingular={objectMetadataItem.nameSingular}
            record={record}
            variant={EntityChipVariant.Transparent}
          />
          {isCompactModeActive && (
            <StyledCompactIconContainer className="compact-icon-container">
              <LightIconButton
                Icon={IconEye}
                accent="tertiary"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsCardInCompactMode(false);
                }}
              />
            </StyledCompactIconContainer>
          )}
          <StyledCheckboxContainer className="checkbox-container">
            <Checkbox
              checked={isCurrentCardSelected}
              onChange={() => setIsCurrentCardSelected(!isCurrentCardSelected)}
              variant={CheckboxVariant.Secondary}
            />
          </StyledCheckboxContainer>
        </StyledBoardCardHeader>
        <StyledBoardCardBody>
          <AnimatedEaseInOut
            isOpen={!isCardInCompactMode || !isCompactModeActive}
            initial={false}
          >
            {visibleFieldDefinitions.map((fieldDefinition) => (
              <PreventSelectOnClickContainer
                key={fieldDefinition.fieldMetadataId}
              >
                <FieldContext.Provider
                  value={{
                    entityId: recordId,
                    maxWidth: 156,
                    recoilScopeId: recordId + fieldDefinition.fieldMetadataId,
                    isLabelIdentifier: false,
                    fieldDefinition: {
                      disableTooltip: false,
                      fieldMetadataId: fieldDefinition.fieldMetadataId,
                      label: fieldDefinition.label,
                      iconName: fieldDefinition.iconName,
                      type: fieldDefinition.type,
                      metadata: fieldDefinition.metadata,
                      defaultValue: fieldDefinition.defaultValue,
                      editButtonIcon: getFieldButtonIcon({
                        metadata: fieldDefinition.metadata,
                        type: fieldDefinition.type,
                      }),
                    },
                    useUpdateRecord: useUpdateOneRecordHook,
                    hotkeyScope: InlineCellHotkeyScope.InlineCell,
                  }}
                >
                  {inView ? (
                    <RecordInlineCell />
                  ) : (
                    <StyledRecordInlineCellPlaceholder />
                  )}
                </FieldContext.Provider>
              </PreventSelectOnClickContainer>
            ))}
          </AnimatedEaseInOut>
        </StyledBoardCardBody>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
};
