import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { type CoreWorkflowRecentRun } from '@/object-core/workflows/types/CoreWorkflowRecentRun';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkflowRunStatusTagProps } from '@/workflow/workflow-diagram/utils/getWorkflowRunStatusTagProps';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

const StyledStrip = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['0.5']};
  height: 100%;
`;

const StyledRunBar = styled.span<{ barColor: string }>`
  background: ${({ barColor }) => barColor};
  border-radius: ${themeCssVariables.border.radius.pill};
  display: block;
  height: ${themeCssVariables.spacing[3]};
  width: 3px;
`;

type CoreWorkflowRecentRunsCellProps = {
  recentRuns: CoreWorkflowRecentRun[] | null;
};

export const CoreWorkflowRecentRunsCell = ({
  recentRuns,
}: CoreWorkflowRecentRunsCellProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  if (!isNonEmptyArray(recentRuns)) {
    return null;
  }

  const oldestFirstRuns = [...recentRuns].reverse();

  return (
    <StyledStrip aria-label={t`Recent runs`}>
      {oldestFirstRuns.map((recentRun) => {
        const { color, text } = getWorkflowRunStatusTagProps({
          workflowRunStatus: recentRun.status,
        });

        return (
          <Tooltip
            key={recentRun.id}
            content={text}
            description={beautifyPastDateRelativeToNow(
              recentRun.createdAt,
              localeCatalog,
            )}
            delay={TooltipDelay.shortDelay}
          >
            <StyledRunBar
              aria-label={text}
              barColor={
                color === 'transparent'
                  ? themeCssVariables.border.color.medium
                  : themeCssVariables.color[color]
              }
            />
          </Tooltip>
        );
      })}
    </StyledStrip>
  );
};
