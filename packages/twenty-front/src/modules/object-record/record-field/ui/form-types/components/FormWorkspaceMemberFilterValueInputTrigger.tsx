import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconUserCircle } from 'twenty-ui-deprecated/display';
import { themeCssVariables } from 'twenty-ui-deprecated/theme-constants';

import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';

const StyledTriggerLabel = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  margin: ${themeCssVariables.spacing[2]};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledPlaceholderContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

type FormWorkspaceMemberFilterValueInputTriggerProps = {
  isVariableValue: boolean;
  defaultValue?: string | null;
  isCurrentWorkspaceMemberSelected: boolean;
  triggerDisplayText: string | null;
  readonly?: boolean;
  onUnlinkVariable: () => void;
};

export const FormWorkspaceMemberFilterValueInputTrigger = ({
  isVariableValue,
  defaultValue,
  isCurrentWorkspaceMemberSelected,
  triggerDisplayText,
  readonly,
  onUnlinkVariable,
}: FormWorkspaceMemberFilterValueInputTriggerProps) => {
  if (isVariableValue) {
    return (
      <VariableChipStandalone
        rawVariableName={defaultValue ?? ''}
        onRemove={readonly ? undefined : onUnlinkVariable}
        isFullRecord
      />
    );
  }

  if (isDefined(triggerDisplayText)) {
    return (
      <StyledTriggerLabel>
        {isCurrentWorkspaceMemberSelected && <IconUserCircle size={12} />}
        {triggerDisplayText}
      </StyledTriggerLabel>
    );
  }

  return (
    <StyledPlaceholderContainer>
      <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
    </StyledPlaceholderContainer>
  );
};
