import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { RecordChip } from '@/object-record/components/RecordChip';
import { VariableChip } from '@/object-record/record-field/form-types/components/VariableChip';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import {
  RecordId,
  Variable,
} from '@/workflow/workflow-steps/workflow-actions/components/WorkflowSingleRecordPicker';
import styled from '@emotion/styled';

const StyledRecordChip = styled(RecordChip)`
  margin: ${({ theme }) => theme.spacing(2)};
`;

const StyledPlaceholder = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
  margin: ${({ theme }) => theme.spacing(2)};
`;

type WorkflowSingleRecordFieldChipProps = {
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
  onRemove: () => void;
};

export const WorkflowSingleRecordFieldChip = ({
  draftValue,
  selectedRecord,
  objectNameSingular,
  onRemove,
}: WorkflowSingleRecordFieldChipProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  if (
    !!draftValue &&
    draftValue.type === 'variable' &&
    isStandaloneVariableString(draftValue.value)
  ) {
    return (
      <VariableChip
        rawVariableName={objectMetadataItem.labelSingular}
        onRemove={onRemove}
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
