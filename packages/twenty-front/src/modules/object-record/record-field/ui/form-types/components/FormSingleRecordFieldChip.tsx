import { RecordChip } from '@/object-record/components/RecordChip';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconForbid } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRecordChipContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

const StyledPlaceholderContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]};
`;

const StyledNoRecordContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  margin: ${themeCssVariables.spacing[2]};
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
};

export const FormSingleRecordFieldChip = ({
  draftValue,
  selectedRecord,
  objectNameSingular,
  onRemove,
  disabled,
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
      <StyledNoRecordContainer>
        <IconForbid size={12} />
        {t`No record`}
      </StyledNoRecordContainer>
    );
  }

  if (draftValue.type === 'static' && isDefined(selectedRecord)) {
    return (
      <StyledRecordChipContainer>
        <RecordChip
          record={selectedRecord}
          objectNameSingular={objectNameSingular}
        />
      </StyledRecordChipContainer>
    );
  }

  return (
    <StyledPlaceholderContainer>
      <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
    </StyledPlaceholderContainer>
  );
};
