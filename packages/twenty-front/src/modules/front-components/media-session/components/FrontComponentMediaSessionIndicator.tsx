import { FrontComponentMediaSessionTooltipRow } from '@/front-components/media-session/components/FrontComponentMediaSessionTooltipRow';
import { frontComponentMediaSessionsState } from '@/front-components/media-session/states/frontComponentMediaSessionsState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import groupBy from 'lodash.groupby';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { Popover } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledDot = styled.span<{ isCapturing: boolean }>`
  background: ${({ isCapturing }) =>
    isCapturing ? themeCssVariables.color.orange : 'transparent'};
  border: 1px solid ${themeCssVariables.color.orange};
  border-radius: 50%;
  box-sizing: border-box;
  corner-shape: round;
  height: ${themeCssVariables.spacing[2]};
  width: ${themeCssVariables.spacing[2]};
`;

const StyledPopup = styled(Popover.Popup)`
  gap: ${themeCssVariables.spacing[3]};
  max-width: 300px;
  min-width: 220px;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledApplications = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const FrontComponentMediaSessionIndicator = () => {
  const frontComponentMediaSessions = useAtomStateValue(
    frontComponentMediaSessionsState,
  );

  if (!isNonEmptyArray(frontComponentMediaSessions)) {
    return null;
  }

  const isCapturing = frontComponentMediaSessions.some((session) =>
    isNonEmptyArray(session.activeMediaTypes),
  );
  const title = isCapturing ? t`Apps recording` : t`Recording requests`;
  const sessionsByApplication = groupBy(
    frontComponentMediaSessions,
    'applicationId',
  );

  return (
    <Popover.Root>
      <Popover.Trigger
        render={
          <LightIconButton size="sm" aria-label={title}>
            <StyledDot isCapturing={isCapturing} aria-hidden />
          </LightIconButton>
        }
        openOnHover
      />
      <Popover.Portal>
        <Popover.Positioner side="bottom" align="start">
          <StyledPopup initialFocus={false}>
            <Popover.Title>{title}</Popover.Title>
            <StyledApplications role="list" aria-label={title}>
              {Object.entries(sessionsByApplication).map(
                ([applicationId, sessions]) => (
                  <FrontComponentMediaSessionTooltipRow
                    key={applicationId}
                    sessions={sessions}
                  />
                ),
              )}
            </StyledApplications>
          </StyledPopup>
        </Popover.Positioner>
      </Popover.Portal>
    </Popover.Root>
  );
};
