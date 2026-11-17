import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { dateLocaleState } from '@/localization/states/dateLocaleState';
import { type CoreObjectRecentRun } from '@/object-core/types/CoreObjectRecentRun';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
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

type CoreObjectRecentRunsCellProps = {
  recentRuns: CoreObjectRecentRun[] | null;
};

export const CoreObjectRecentRunsCell = ({
  recentRuns,
}: CoreObjectRecentRunsCellProps) => {
  const { t } = useLingui();
  const { localeCatalog } = useAtomStateValue(dateLocaleState);

  if (!isNonEmptyArray(recentRuns)) {
    return null;
  }

  const oldestFirstRuns = [...recentRuns].reverse();

  return (
    <StyledStrip aria-label={t`Recent runs`}>
      {oldestFirstRuns.map((recentRun) => (
        <Tooltip
          key={recentRun.id}
          content={recentRun.statusLabel}
          description={beautifyPastDateRelativeToNow(
            recentRun.createdAt,
            localeCatalog,
          )}
          delay={TooltipDelay.shortDelay}
        >
          <StyledRunBar
            aria-label={recentRun.statusLabel}
            barColor={
              recentRun.statusColor === 'transparent'
                ? themeCssVariables.border.color.medium
                : themeCssVariables.color[recentRun.statusColor]
            }
          />
        </Tooltip>
      ))}
    </StyledStrip>
  );
};
