import { MediaAccessSessionRow } from '@/media-access/components/MediaAccessSessionRow';
import { mediaAccessSessionsState } from '@/media-access/states/mediaAccessSessionsState';
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

export const MediaAccessIndicator = () => {
  const mediaAccessSessions = useAtomStateValue(mediaAccessSessionsState);

  if (!isNonEmptyArray(mediaAccessSessions)) {
    return null;
  }

  const isCapturing = mediaAccessSessions.some(
    (session) => session.status === 'capturing',
  );
  const hasPendingRequest = mediaAccessSessions.some(
    (session) => session.status === 'pending',
  );
  const getTitle = () => {
    if (isCapturing) {
      return t`Microphone or camera in use`;
    }

    if (hasPendingRequest) {
      return t`Media access requests`;
    }

    return t`Media access enabled`;
  };
  const title = getTitle();
  const sessionsByGroupKey = groupBy(mediaAccessSessions, (session) =>
    session.status === 'delegated'
      ? `${session.ownerId}:delegated:${session.origin}`
      : session.ownerId,
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
              {Object.entries(sessionsByGroupKey).map(
                ([sessionGroupKey, sessions]) => (
                  <MediaAccessSessionRow
                    key={sessionGroupKey}
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
