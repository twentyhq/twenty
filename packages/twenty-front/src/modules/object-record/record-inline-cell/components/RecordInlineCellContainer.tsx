import { useAICElement } from '@aicorg/sdk-react';
import { styled } from '@linaria/react';
import { type HTMLAttributes, useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFieldFocus } from '@/object-record/record-field/ui/hooks/useFieldFocus';
import { RecordInlineCellValue } from '@/object-record/record-inline-cell/components/RecordInlineCellValue';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';

import { assertFieldMetadata } from '@/object-record/record-field/ui/types/guards/assertFieldMetadata';
import { isFieldText } from '@/object-record/record-field/ui/types/guards/isFieldText';
import {
  AppTooltip,
  OverflowingTextWithTooltip,
  TooltipDelay,
} from 'twenty-ui/display';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { useRecordInlineCellContext } from './RecordInlineCellContext';

const StyledIconContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
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
  align-self: flex-start;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: 24px;
`;

const StyledValueContainer = styled.div<{ readonly: boolean }>`
  display: flex;
  min-width: 0;
  position: relative;
  width: 100%;
`;

const StyledLabelContainer = styled.div<{ width?: number }>`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  width: ${({ width }) => (width !== undefined ? `${width}px` : 'auto')};
`;

const StyledInlineCellBaseContainer = styled.div<{ readonly: boolean }>`
  align-items: center;
  box-sizing: border-box;
  cursor: ${({ readonly }) => (readonly ? 'default' : 'pointer')};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  height: fit-content;
  user-select: none;
  width: 100%;
`;

export const StyledSkeletonDiv = styled.div`
  height: 24px;
`;

export const RecordInlineCellContainer = () => {
  const { readonly, IconLabel, label, labelWidth, showLabel, isEditModeOpen } =
    useRecordInlineCellContext();
  const { theme } = useContext(ThemeContext);

  const { recordId, fieldDefinition, onMouseEnter, onMouseLeave, anchorId } =
    useContext(FieldContext);

  if (isFieldText(fieldDefinition)) {
    assertFieldMetadata(FieldMetadataType.TEXT, isFieldText, fieldDefinition);
  }

  const { setIsFocused } = useFieldFocus();

  const handleContainerMouseEnter = () => {
    if (!readonly) {
      setIsFocused(true);
    }
    onMouseEnter?.();
  };

  const handleContainerMouseLeave = () => {
    if (!readonly) {
      setIsFocused(false);
    }
    onMouseLeave?.();
  };

  const labelId = `label-${getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition?.metadata?.fieldName,
  })}`;

  const fieldEntryMetadata = buildOpportunityStageEntryAICMetadata({
    isEditModeOpen,
    recordId,
    fieldName: fieldDefinition?.metadata?.fieldName,
    objectNameSingular: fieldDefinition?.metadata?.objectMetadataNameSingular,
    fieldLabel: fieldDefinition?.label,
  });

  return (
    <StyledInlineCellBaseContainer
      readonly={readonly ?? false}
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {(IconLabel || label) && (
        <StyledLabelAndIconContainer id={labelId}>
          {IconLabel && (
            <StyledIconContainer>
              <IconLabel stroke={theme.icon.stroke.sm} />
            </StyledIconContainer>
          )}
          {showLabel && (
            <StyledLabelContainer width={labelWidth}>
              <OverflowingTextWithTooltip text={label} displayedMaxRows={1} />
            </StyledLabelContainer>
          )}
          {/* TODO: Displaying Tooltips on the board is causing performance issues https://react-tooltip.com/docs/examples/render */}
          {!showLabel && (
            <AppTooltip
              anchorSelect={`#${labelId}`}
              content={label}
              clickable
              noArrow
              place="bottom"
              positionStrategy="fixed"
              delay={TooltipDelay.shortDelay}
            />
          )}
        </StyledLabelAndIconContainer>
      )}
      <StyledValueContainer readonly={readonly ?? false} id={anchorId}>
        <RecordInlineCellAICBridge metadata={fieldEntryMetadata}>
          {(containerAttributes) => (
            <RecordInlineCellValue containerAttributes={containerAttributes} />
          )}
        </RecordInlineCellAICBridge>
      </StyledValueContainer>
    </StyledInlineCellBaseContainer>
  );
};

const RecordInlineCellAICBridge = ({
  metadata,
  children,
}: {
  metadata: ReturnType<typeof buildOpportunityStageEntryAICMetadata>;
  children: (
    containerAttributes?: HTMLAttributes<HTMLDivElement>,
  ) => React.ReactNode;
}) => {
  if (!metadata) {
    return children();
  }

  const { attributes } = useAICElement(metadata, {
    defaultAction: 'click',
  });

  return children(attributes as HTMLAttributes<HTMLDivElement>);
};

const buildOpportunityStageEntryAICMetadata = ({
  isEditModeOpen,
  recordId,
  fieldName,
  objectNameSingular,
  fieldLabel,
}: {
  isEditModeOpen?: boolean;
  recordId: string;
  fieldName?: string;
  objectNameSingular?: string;
  fieldLabel?: string;
}) => {
  if (objectNameSingular !== 'opportunity' || fieldName !== 'stage') {
    return null;
  }

  return {
    agentId: isEditModeOpen
      ? `opportunity.stage.select_trigger.${recordId}`
      : `opportunity.stage.open_editor.${recordId}`,
    agentAction: 'click' as const,
    agentDescription: isEditModeOpen
      ? 'Open the stage option list for this exact opportunity from the active inline editor.'
      : 'Open the opportunity stage editor for this exact record before choosing a new stage.',
    agentEntityId: recordId,
    agentEntityLabel: `Opportunity ${recordId}`,
    agentEntityType: 'opportunity',
    agentLabel: isEditModeOpen
      ? `${fieldLabel ?? 'Stage'} current value`
      : fieldLabel ?? 'Stage',
    agentRisk: 'medium' as const,
    agentWorkflowStep: isEditModeOpen
      ? 'opportunity.stage.open_selector'
      : 'opportunity.stage.open_editor',
  };
};
