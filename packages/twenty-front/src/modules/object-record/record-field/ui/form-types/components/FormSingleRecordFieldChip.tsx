import { t } from '@lingui/core/macro';
import { RecordChip } from '@/object-record/components/RecordChip';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import {
  type RecordId,
  type Variable,
} from '@/object-record/record-field/ui/form-types/components/FormSingleRecordPicker';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';

const StyledRecordChip = styled(RecordChip)`
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlaceholder = styled(FormFieldPlaceholder)`
  margin: ${({ theme }) => theme.spacing(2)};
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
    !!draftValue &&
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

  if (!!draftValue && draftValue.type === 'static' && !!selectedRecord) {
    return (
      <StyledRecordChip
        record={selectedRecord}
        objectNameSingular={objectNameSingular}
      />
    );
  }

  return (
    <StyledPlaceholder>{t`Select a ${objectNameSingular}`}</StyledPlaceholder>
  );
};
