import { styled } from '@linaria/react';
import { msg } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';
import { ProgressBar } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';

const STATUS_LABELS = {
  pending: msg`Pending`,
  running: msg`Running`,
  success: msg`Succeeded`,
  failed: msg`Failed`,
  blocked: msg`Blocked`,
  uncertain: msg`Outcome unknown`,
  skipped: msg`Skipped`,
};

const STATUS_COLORS = {
  pending: 'gray',
  running: 'blue',
  success: 'green',
  failed: 'red',
  blocked: 'orange',
  uncertain: 'orange',
  skipped: 'gray',
} as const;

const StyledOutcome = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledDescription = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
  overflow-wrap: anywhere;
`;

type AiChatApprovalOutcomeProps = {
  status: AiChatApprovalReviewStatus;
  message?: string;
  progress?: { completed: number; total: number };
};

export const AiChatApprovalOutcome = ({
  status,
  message,
  progress,
}: AiChatApprovalOutcomeProps) => {
  const { t } = useLingui();

  return (
    <StyledOutcome>
      <StyledDescription>
        <Tag color={STATUS_COLORS[status]} variant="soft">
          {t(STATUS_LABELS[status])}
        </Tag>
        {isDefined(message) && <span>{message}</span>}
      </StyledDescription>
      {status === 'running' && isDefined(progress) && progress.total > 0 && (
        <ProgressBar
          aria-label={t`Action progress`}
          value={progress.completed}
          max={progress.total}
          size="sm"
        />
      )}
    </StyledOutcome>
  );
};
