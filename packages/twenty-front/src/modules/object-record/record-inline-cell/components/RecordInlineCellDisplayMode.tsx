import { styled } from '@linaria/react';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useIsFieldEmpty } from '@/object-record/record-field/ui/hooks/useIsFieldEmpty';
import { useIsFieldInputOnly } from '@/object-record/record-field/ui/hooks/useIsFieldInputOnly';
import { RecordFieldComponentInstanceContext } from '@/object-record/record-field/ui/states/contexts/RecordFieldComponentInstanceContext';
import {
  useRecordInlineCellContext,
  type RecordInlineCellContextProps,
} from '@/object-record/record-inline-cell/components/RecordInlineCellContext';
import { RecordInlineCellButton } from '@/object-record/record-inline-cell/components/RecordInlineCellEditButton';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useLingui } from '@lingui/react/macro';
import { type HTMLAttributes, useContext } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordInlineCellNormalModeOuterContainer = styled.div<
  Pick<
    RecordInlineCellContextProps,
    'isDisplayModeFixHeight' | 'disableHoverEffect' | 'readonly'
  > & {
    isHovered?: boolean;
    disablePointerEvents?: boolean;
    promoteAboveOverlays?: boolean;
  }
>`
  align-items: center;
  background-color: ${({ isHovered, readonly, disableHoverEffect }) =>
    isHovered && !readonly && !disableHoverEffect
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isHovered, readonly }) =>
    isHovered && !readonly ? 'pointer' : 'default'};
  display: flex;
  height: ${({ isDisplayModeFixHeight }) =>
    isDisplayModeFixHeight ? '16px' : 'auto'};
  min-height: 16px;
  outline: 1px solid
    ${({ isHovered, readonly }) =>
      isHovered && readonly
        ? themeCssVariables.border.color.medium
        : 'transparent'};
  overflow: hidden;
  padding-left: ${themeCssVariables.spacing[1]};
  padding-right: ${themeCssVariables.spacing[1]};
  pointer-events: ${({ disablePointerEvents }) =>
    disablePointerEvents ? 'none' : 'auto'};
  position: relative;
  z-index: ${({ promoteAboveOverlays }) => (promoteAboveOverlays ? 1 : 'auto')};

  * {
    pointer-events: none;
  }
`;

const StyledRecordInlineCellNormalModeInnerContainer = styled.div`
  align-content: center;
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  height: fit-content;

  overflow: hidden;
  padding-bottom: 2px;
  padding-top: 2px;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyField = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.light};
  display: flex;
  height: 20px;
`;

export const RecordInlineCellDisplayMode = ({
  children,
  onClick,
  isHovered,
  containerAttributes,
}: React.PropsWithChildren<{
  isHovered: boolean;
  onClick?: () => void;
  containerAttributes?: HTMLAttributes<HTMLDivElement>;
}>) => {
  const { t } = useLingui();
  const recordFieldInstanceId = useAvailableComponentInstanceIdOrThrow(
    RecordFieldComponentInstanceContext,
  );
  const focusStack = useAtomStateValue(focusStackState);

  const { editModeContentOnly, label, buttonIcon, readonly, isEditModeOpen } =
    useRecordInlineCellContext();

  const { isForbidden, recordId, fieldDefinition } = useContext(FieldContext);
  const isCurrentFieldEditing = focusStack.some(
    (item) =>
      item.componentInstance.componentInstanceId === recordFieldInstanceId,
  );

  const isFieldEmpty = useIsFieldEmpty();
  const showEditButton =
    buttonIcon &&
    isHovered &&
    !readonly &&
    !isFieldEmpty &&
    !editModeContentOnly;

  const isFieldInputOnly = useIsFieldInputOnly();

  const emptyPlaceHolder = label ?? t`Empty`;

  const shouldShowValue = !isFieldEmpty || isFieldInputOnly || isForbidden;

  const shouldShowEmptyPlaceholder = isFieldEmpty && !isForbidden;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!onClick || readonly) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  const stageAttributes = buildOpportunityStageDisplayAICAttributes({
    recordId,
    fieldLabel: label,
    fieldName: fieldDefinition.metadata.fieldName,
    isEditModeOpen,
    isCurrentFieldEditing,
    objectNameSingular: fieldDefinition.metadata.objectMetadataNameSingular,
  });
  const shouldDisableStagePointerEvents =
    fieldDefinition.metadata.objectMetadataNameSingular === 'opportunity' &&
    fieldDefinition.metadata.fieldName === 'stage' &&
    isCurrentFieldEditing &&
    !isEditModeOpen;
  const shouldPromoteStageSelectorEntry =
    stageAttributes?.['data-agent-id']?.includes('.select_trigger.') ?? false;

  return (
    <>
      <StyledRecordInlineCellNormalModeOuterContainer
        disablePointerEvents={shouldDisableStagePointerEvents}
        isHovered={isHovered}
        promoteAboveOverlays={shouldPromoteStageSelectorEntry}
        readonly={readonly}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        data-inline-editable={onClick ? '1' : '0'}
        role={readonly ? undefined : 'button'}
        tabIndex={readonly ? -1 : 0}
        {...containerAttributes}
        {...stageAttributes}
      >
        <StyledRecordInlineCellNormalModeInnerContainer>
          {shouldShowValue ? (
            children
          ) : shouldShowEmptyPlaceholder ? (
            <StyledEmptyField>{emptyPlaceHolder}</StyledEmptyField>
          ) : null}
        </StyledRecordInlineCellNormalModeInnerContainer>
      </StyledRecordInlineCellNormalModeOuterContainer>
      {showEditButton && (
        <RecordInlineCellButton Icon={buttonIcon} onClick={onClick} />
      )}
    </>
  );
};

const buildOpportunityStageDisplayAICAttributes = ({
  recordId,
  fieldLabel,
  fieldName,
  isEditModeOpen,
  isCurrentFieldEditing,
  objectNameSingular,
}: {
  recordId: string;
  fieldLabel?: string;
  fieldName?: string;
  isEditModeOpen?: boolean;
  isCurrentFieldEditing?: boolean;
  objectNameSingular?: string;
}): HTMLAttributes<HTMLDivElement> | undefined => {
  if (objectNameSingular !== 'opportunity' || fieldName !== 'stage') {
    return undefined;
  }

  const isSelectorEntryActive = isEditModeOpen || isCurrentFieldEditing;

  return {
    'data-agent-id': isSelectorEntryActive
      ? `opportunity.stage.select_trigger.${recordId}`
      : `opportunity.stage.open_editor.${recordId}`,
    'data-agent-action': 'click',
    'data-agent-description': isSelectorEntryActive
      ? 'Open the stage option list for this exact opportunity from the active inline editor.'
      : 'Open the opportunity stage editor for this exact record before choosing a new stage.',
    'data-agent-entity-id': recordId,
    'data-agent-entity-label': `Opportunity ${recordId}`,
    'data-agent-entity-type': 'opportunity',
    'data-agent-label': isSelectorEntryActive
      ? `${fieldLabel ?? 'Stage'} current value`
      : fieldLabel ?? 'Stage',
    'data-agent-risk': 'medium',
    'data-agent-workflow': isSelectorEntryActive
      ? 'opportunity.stage.open_selector'
      : 'opportunity.stage.open_editor',
  } satisfies HTMLAttributes<HTMLDivElement>;
};
