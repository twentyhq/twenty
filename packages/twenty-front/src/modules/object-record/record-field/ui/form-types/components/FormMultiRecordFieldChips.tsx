import { RecordChip } from '@/object-record/components/RecordChip';
import { FormFieldPlaceholder } from '@/object-record/record-field/ui/form-types/components/FormFieldPlaceholder';
import { VariableChipStandalone } from '@/object-record/record-field/ui/form-types/components/VariableChipStandalone';
import { type FormMultiRecordPickerDraftValue } from '@/object-record/record-field/ui/form-types/utils/getFormMultiRecordPickerDraftValue';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';
import { isStandaloneVariableString } from '@/workflow/utils/isStandaloneVariableString';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledChipsContainer = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  margin-inline: ${themeCssVariables.spacing[2]};
  min-width: 0;
  overflow: hidden;
`;

type FormMultiRecordFieldChipsProps = {
  draftValue: FormMultiRecordPickerDraftValue;
  selectedRecords: ObjectRecord[];
  objectNameSingular: string;
  readonly?: boolean;
  onUnlinkVariable: () => void;
  onRemoveStaticVariable: (variable: string) => void;
};

export const FormMultiRecordFieldChips = ({
  draftValue,
  selectedRecords,
  objectNameSingular,
  readonly,
  onUnlinkVariable,
  onRemoveStaticVariable,
}: FormMultiRecordFieldChipsProps) => {
  if (draftValue.type === 'variable') {
    return (
      <StyledChipsContainer>
        <VariableChipStandalone
          rawVariableName={draftValue.value}
          onRemove={readonly ? undefined : onUnlinkVariable}
          isFullRecord
        />
      </StyledChipsContainer>
    );
  }

  const staticVariables = draftValue.value.filter((entry) =>
    isStandaloneVariableString(entry),
  );

  if (selectedRecords.length === 0 && staticVariables.length === 0) {
    return (
      <StyledChipsContainer>
        <FormFieldPlaceholder>{t`Select`}</FormFieldPlaceholder>
      </StyledChipsContainer>
    );
  }

  const chips = [
    ...selectedRecords.map((record) => (
      <RecordChip
        key={record.id}
        record={record}
        objectNameSingular={objectNameSingular}
      />
    )),
    ...staticVariables.map((variable) => (
      <VariableChipStandalone
        key={variable}
        rawVariableName={variable}
        onRemove={readonly ? undefined : () => onRemoveStaticVariable(variable)}
        isFullRecord
      />
    )),
  ];

  return (
    <StyledChipsContainer>
      <ExpandableList isChipCountDisplayed={true}>{chips}</ExpandableList>
    </StyledChipsContainer>
  );
};
