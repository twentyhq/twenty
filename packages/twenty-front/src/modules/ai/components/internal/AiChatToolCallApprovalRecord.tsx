import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordChip } from '@/object-record/components/RecordChip';
import { AiChatToolCallApprovalRecordStoreEffect } from '@/ai/components/internal/AiChatToolCallApprovalRecordStoreEffect';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

const StyledRecordRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledMissingRecord = styled.span`
  color: ${themeCssVariables.font.color.danger};
`;

type AiChatToolCallApprovalRecordProps = {
  objectNameSingular: string;
  recordId: string;
  isDeletion: boolean;
};

export const AiChatToolCallApprovalRecord = ({
  objectNameSingular,
  recordId,
  isDeletion,
}: AiChatToolCallApprovalRecordProps) => {
  const { t } = useLingui();
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  if (loading) {
    return null;
  }

  return (
    <StyledRecordRow>
      {isDeletion ? t`This record will be deleted:` : t`Record:`}
      {isDefined(record) ? (
        <>
          <AiChatToolCallApprovalRecordStoreEffect record={record} />
          <RecordChip objectNameSingular={objectNameSingular} record={record} />
        </>
      ) : (
        // approving still runs the call, which then fails, so the person must see why
        <StyledMissingRecord>
          {isDefined(error)
            ? t`This record could not be loaded.`
            : t`This record no longer exists or you cannot see it.`}
        </StyledMissingRecord>
      )}
    </StyledRecordRow>
  );
};
