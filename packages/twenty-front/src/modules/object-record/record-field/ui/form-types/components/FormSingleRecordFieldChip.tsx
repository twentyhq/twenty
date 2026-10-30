import { RecordChip } from '@/object-record/components/RecordChip';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/types/RecordPickerValue';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type FormFieldInputVariant } from '@/ui/input/types/FormFieldInputVariant';
import { isStandaloneVariableString } from 'twenty-shared/workflow';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const getInset = ({ $variant }: { $variant?: FormFieldInputVariant }) =>
  $variant === 'transparent' ? '0' : themeCssVariables.spacing[2];

const StyledRecordChipContainer = styled.div<{
  $variant?: FormFieldInputVariant;
}>`
  margin: ${getInset};
`;

const StyledPlaceholderContainer = styled.div<{
  $variant?: FormFieldInputVariant;
}>`
  margin: ${getInset};
`;

const StyledNoRecordContainer = styled.div<{
  $variant?: FormFieldInputVariant;
}>`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin: ${getInset};
`;

type FormSingleRecordFieldChipProps = {
  draftValue:
    | {
        type: 'static';
        value: RecordId;
      }
    | {
        type: 'variable';
        value: Variable;
      }
    | {
        type: 'no-record';
        value: null;
      };
  selectedRecord?: ObjectRecord;
  objectNameSingular: string;
  onRemove: (event?: React.MouseEvent<HTMLDivElement>) => void;
  disabled?: boolean;
  variant?: FormFieldInputVariant;
};

export const FormSingleRecordFieldChip = ({
  draftValue,
  selectedRecord,
  objectNameSingular,
  onRemove,
  disabled,
  variant,
}: FormSingleRecordFieldChipProps) => {
  if (
    draftValue.type === 'variable' &&
    isStandaloneVariableString(draftValue.value)
  ) {
    return (
      <VariableChipStandalone
        rawVariableName={draftValue.value}
        onRemove={disabled ? undefined : onRemove}
        isFullRecord
      />
    );
  }

  if (draftValue.type === 'no-record') {
    return (
      <StyledNoRecordContainer $variant={variant}>
        <IconForbid size={12} />
        {t`No record`}
      </StyledNoRecordContainer>
    );
  }

  if (draftValue.type === 'static' && isDefined(selectedRecord)) {
    return (
      <StyledRecordChipContainer $variant={variant}>
        <RecordChip
          record={selectedRecord}
          objectNameSingular={objectNameSingular}
        />
      </StyledRecordChipContainer>
    );
  }

  return (
    <StyledPlaceholderContainer $variant={variant}>
      <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
    </StyledPlaceholderContainer>
  );
};
