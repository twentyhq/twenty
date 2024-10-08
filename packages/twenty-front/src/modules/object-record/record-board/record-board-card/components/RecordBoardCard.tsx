import { useActionMenu } from '@/action-menu/hooks/useActionMenu';
import { actionMenuDropdownPositionComponentState } from '@/action-menu/states/actionMenuDropdownPositionComponentState';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useRecordBoardStates } from '@/object-record/record-board/hooks/internal/useRecordBoardStates';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { RecordBoardScopeInternalContext } from '@/object-record/record-board/scopes/scope-internal-context/RecordBoardScopeInternalContext';
import {
  FieldContext,
  RecordUpdateHook,
  RecordUpdateHookParams,
} from '@/object-record/record-field/contexts/FieldContext';
import { getFieldButtonIcon } from '@/object-record/record-field/utils/getFieldButtonIcon';
import { RecordIdentifierChip } from '@/object-record/record-index/components/RecordIndexRecordChip';
import { RecordInlineCell } from '@/object-record/record-inline-cell/components/RecordInlineCell';
import { RecordInlineCellEditMode } from '@/object-record/record-inline-cell/components/RecordInlineCellEditMode';
import { InlineCellHotkeyScope } from '@/object-record/record-inline-cell/types/InlineCellHotkeyScope';
import { RecordValueSetterEffect } from '@/object-record/record-store/components/RecordValueSetterEffect';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { Checkbox, CheckboxVariant } from '@/ui/input/components/Checkbox';
import { TextInput } from '@/ui/input/components/TextInput';
import { AnimatedEaseInOut } from '@/ui/utilities/animation/components/AnimatedEaseInOut';
import { useAvailableScopeIdOrThrow } from '@/ui/utilities/recoil-scope/scopes-internal/hooks/useAvailableScopeId';
import { RecordBoardScrollWrapperContext } from '@/ui/utilities/scroll/contexts/ScrollWrapperContexts';
import { extractComponentState } from '@/ui/utilities/state/component-state/utils/extractComponentState';
import styled from '@emotion/styled';
import { ReactNode, useContext, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { AvatarChipVariant, IconEye, IconEyeOff } from 'twenty-ui';
import { useDebouncedCallback } from 'use-debounce';
import { useAddNewCard } from '../../record-board-column/hooks/useAddNewCard';

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

const StyledTextInput = styled(TextInput)`
  backdrop-filter: blur(12px) saturate(200%) contrast(50%) brightness(130%);
  background: ${({ theme }) => theme.background.primary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  width: ${({ theme }) => theme.spacing(53)};
  border-radius: ${({ theme }) => theme.border.radius.sm};
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
    theme.spacing(showCompactView ? 2 : 1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
  padding-right: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  transition: padding ease-in-out 160ms;

  img {
    height: ${({ theme }) => theme.icon.size.md}px;
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
  max-width: 100%;
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

export const RecordBoardCard = ({
  isCreating = false,
  onCreateSuccess,
  position,
}: {
  isCreating?: boolean;
  onCreateSuccess?: () => void;
  position?: 'first' | 'last';
}) => {
  const [newLabelValue, setNewLabelValue] = useState('');
  const { handleBlur, handleInputEnter } = useAddNewCard();
  const { recordId } = useContext(RecordBoardCardContext);
  const { updateOneRecord, objectMetadataItem } =
    useContext(RecordBoardContext);
  const {
    isCompactModeActiveState,
    isRecordBoardCardSelectedFamilyState,
    visibleFieldDefinitionsState,
  } = useRecordBoardStates();
  const isCompactModeActive = useRecoilValue(isCompactModeActiveState);

  const [isCardExpanded, setIsCardExpanded] = useState(false);

  const [isCurrentCardSelected, setIsCurrentCardSelected] = useRecoilState(
    isRecordBoardCardSelectedFamilyState(recordId),
  );

  const visibleFieldDefinitions = useRecoilValue(
    visibleFieldDefinitionsState(),
  );

  const record = useRecoilValue(recordStoreFamilyState(recordId));

  const recordBoardId = useAvailableScopeIdOrThrow(
    RecordBoardScopeInternalContext,
  );

  const setActionMenuDropdownPosition = useSetRecoilState(
    extractComponentState(
      actionMenuDropdownPositionComponentState,
      `action-menu-dropdown-${recordBoardId}`,
    ),
  );

  const { openActionMenuDropdown } = useActionMenu(recordBoardId);

  const handleActionMenuDropdown = (event: React.MouseEvent) => {
    event.preventDefault();
    setIsCurrentCardSelected(true);
    setActionMenuDropdownPosition({
      x: event.clientX,
      y: event.clientY,
    });
    openActionMenuDropdown();
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

  const onMouseLeaveBoard = useDebouncedCallback(() => {
    if (isCompactModeActive && isCardExpanded) {
      setIsCardExpanded(false);
    }
  }, 800);

  const useUpdateOneRecordHook: RecordUpdateHook = () => {
    const updateEntity = ({ variables }: RecordUpdateHookParams) => {
      updateOneRecord?.({
        idToUpdate: variables.where.id as string,
        updateOneRecordInput: variables.updateOneRecordInput,
      });
    };

    return [updateEntity, { loading: false }];
  };

  const scrollWrapperRef = useContext(RecordBoardScrollWrapperContext);

  const { ref: cardRef, inView } = useInView({
    root: scrollWrapperRef?.ref.current,
    rootMargin: '1000px',
  });

  const visibleFieldDefinitionsFiltered = visibleFieldDefinitions.filter(
    (boardField) => !boardField.isLabelIdentifier,
  );

  const labelIdentifierField = visibleFieldDefinitions.find(
    (field) => field.isLabelIdentifier,
  );

  return (
    <StyledBoardCardWrapper onContextMenu={handleActionMenuDropdown}>
      {!isCreating && <RecordValueSetterEffect recordId={recordId} />}
      <StyledBoardCard
        ref={cardRef}
        selected={isCurrentCardSelected}
        onMouseLeave={onMouseLeaveBoard}
        onClick={() => {
          if (!isCreating) {
            setIsCurrentCardSelected(!isCurrentCardSelected);
          }
        }}
      >
        <StyledBoardCardHeader showCompactView={isCompactModeActive}>
          {isCreating && position !== undefined ? (
            <RecordInlineCellEditMode>
              <StyledTextInput
                autoFocus
                value={newLabelValue}
                onInputEnter={() =>
                  handleInputEnter(
                    labelIdentifierField?.label ?? '',
                    newLabelValue,
                    position,
                    onCreateSuccess,
                  )
                }
                onBlur={() =>
                  handleBlur(
                    labelIdentifierField?.label ?? '',
                    newLabelValue,
                    position,
                    onCreateSuccess,
                  )
                }
                onChange={(text: string) => setNewLabelValue(text)}
                placeholder={labelIdentifierField?.label}
              />
            </RecordInlineCellEditMode>
          ) : (
            <RecordIdentifierChip
              objectNameSingular={objectMetadataItem.nameSingular}
              record={record as ObjectRecord}
              variant={AvatarChipVariant.Transparent}
            />
          )}

          {!isCreating && (
            <>
              {isCompactModeActive && (
                <StyledCompactIconContainer className="compact-icon-container">
                  <LightIconButton
                    Icon={isCardExpanded ? IconEyeOff : IconEye}
                    accent="tertiary"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsCardExpanded((prev) => !prev);
                    }}
                  />
                </StyledCompactIconContainer>
              )}

              <StyledCheckboxContainer className="checkbox-container">
                <Checkbox
                  hoverable
                  checked={isCurrentCardSelected}
                  onChange={() =>
                    setIsCurrentCardSelected(!isCurrentCardSelected)
                  }
                  variant={CheckboxVariant.Secondary}
                />
              </StyledCheckboxContainer>
            </>
          )}
        </StyledBoardCardHeader>

        <AnimatedEaseInOut
          isOpen={isCardExpanded || !isCompactModeActive}
          initial={false}
        >
          <StyledBoardCardBody>
            {visibleFieldDefinitionsFiltered.map((fieldDefinition) => (
              <PreventSelectOnClickContainer
                key={fieldDefinition.fieldMetadataId}
              >
                <FieldContext.Provider
                  value={{
                    recordId: isCreating ? '' : recordId,
                    maxWidth: 156,
                    recoilScopeId:
                      (isCreating ? 'new' : recordId) +
                      fieldDefinition.fieldMetadataId,
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
                      settings: fieldDefinition.settings,
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
          </StyledBoardCardBody>
        </AnimatedEaseInOut>
      </StyledBoardCard>
    </StyledBoardCardWrapper>
  );
};
