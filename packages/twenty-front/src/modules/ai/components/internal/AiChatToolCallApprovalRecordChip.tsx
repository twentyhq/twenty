import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { RecordChip } from '@/object-record/components/RecordChip';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';

const StyledMissingRecord = styled.span`
  color: ${themeCssVariables.font.color.danger};
  font-size: ${themeCssVariables.font.size.md};
`;

type AiChatToolCallApprovalRecordChipProps = {
  objectNameSingular: string;
  recordId: string;
};

export const AiChatToolCallApprovalRecordChip = ({
  objectNameSingular,
  recordId,
}: AiChatToolCallApprovalRecordChipProps) => {
  const { t } = useLingui();
  const { record, loading, error } = useFindOneRecord({
    objectNameSingular,
    objectRecordId: recordId,
  });

  if (isDefined(record)) {
    return (
      <RecordChip objectNameSingular={objectNameSingular} record={record} />
    );
  }

  if (loading) {
    return null;
  }

  // approving still runs the call, which then fails, so the person must see why
  return (
    <StyledMissingRecord>
      {isDefined(error)
        ? t`This record could not be loaded.`
        : t`This record no longer exists or you cannot see it.`}
    </StyledMissingRecord>
  );
};
