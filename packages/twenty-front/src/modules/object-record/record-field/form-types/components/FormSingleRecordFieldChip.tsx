import { RecordChip } from '@/object-record/components/RecordChip';
import {
  RecordId,
  Variable,
} from '@/object-record/record-field/form-types/components/FormSingleRecordPicker';
import { VariableChipStandalone } from '@/object-record/record-field/form-types/components/VariableChipStandalone';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import styled from '@emotion/styled';

const StyledRecordChip = styled(RecordChip)`
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
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

  return <StyledPlaceholder>Select a {objectNameSingular}</StyledPlaceholder>;
};
