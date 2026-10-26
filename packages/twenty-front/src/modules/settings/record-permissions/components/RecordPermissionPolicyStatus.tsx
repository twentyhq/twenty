import { useRecordPermissionPolicy } from '@/settings/record-permissions/hooks/useRecordPermissionPolicy';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/components/feedback';

const StyledStatus = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;

export const RecordPermissionPolicyStatus = () => {
  const { state, error, cancel } = useRecordPermissionPolicy();
  const { enqueueToast } = useToast();
  if (error) return <StyledStatus role="alert">{error.message}</StyledStatus>;
  if (!state?.candidateRevisionId) return null;
  const progress = state.progress.find(
    (item) => item.revisionId === state.candidateRevisionId,
  );
  const handleCancel = async () => {
    try {
      await cancel();
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };
  return (
    <StyledStatus role="status">
      <span>
        {state.status === 'failed'
          ? t`Permissions could not be applied. ${state.failureReason ?? ''}`
          : t`Applying permissions. Current access remains active until this finishes.`}
        {progress && ` ${progress.completedObjects} / ${progress.totalObjects}`}
      </span>
      <Button
        size="sm"
        variant="outline"
        onClick={handleCancel}
      >{t`Cancel changes`}</Button>
    </StyledStatus>
  );
};
