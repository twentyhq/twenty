import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatToolCallApprovalFieldDisplay } from '@/ai/components/internal/AiChatToolCallApprovalFieldDisplay';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { type FieldMetadata } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledCurrentValue = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow-wrap: anywhere;
`;

type AiChatToolCallApprovalCurrentValueProps = {
  objectNameSingular: string;
  recordId: string;
  fieldDefinition: FieldDefinition<FieldMetadata>;
};

// the record is loaded in the store by the card, so its value shows as anywhere else in the app
export const AiChatToolCallApprovalCurrentValue = ({
  objectNameSingular,
  recordId,
  fieldDefinition,
}: AiChatToolCallApprovalCurrentValueProps) => {
  const { t } = useLingui();
  const { fieldName } = fieldDefinition.metadata;
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);
  const fieldValue = useRecordFieldValue(recordId, fieldName, fieldDefinition);

  // the card loads the record, and a value read before then would show as empty
  if (!isDefined(recordStore)) {
    return null;
  }

  return (
    <StyledCurrentValue>
      {t`Currently:`}
      {isFieldValueEmpty({ fieldDefinition, fieldValue }) ? (
        t`Empty`
      ) : (
        <AiChatToolCallApprovalFieldDisplay
          objectNameSingular={objectNameSingular}
          recordId={recordId}
          fieldDefinition={fieldDefinition}
        />
      )}
    </StyledCurrentValue>
  );
};
