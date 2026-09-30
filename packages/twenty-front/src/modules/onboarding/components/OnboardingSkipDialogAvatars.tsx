import { OnboardingSkipDialogAvatarItem } from '@/onboarding/components/OnboardingSkipDialogAvatarItem';
import { styled } from '@linaria/react';
import { AvatarGroup } from 'twenty-ui/components';
import { IconPlus } from 'twenty-ui/icon';
import {
  AVATAR_PROPERTIES_BY_SIZE,
  Avatar,
  type AvatarShape,
} from 'twenty-ui/primitives/data-display';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const MAX_VISIBLE_AVATARS = 5;

const EMPTY_SEAT_SIZE = AVATAR_PROPERTIES_BY_SIZE.lg.width;

const StyledEmptySeat = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.primary};
  border: 1px dashed ${themeCssVariables.border.color.strong};
  border-radius: 50%;
  box-shadow: 0 0 0 2px ${themeCssVariables.background.primary};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.light};
  corner-shape: round;
  display: flex;
  height: ${EMPTY_SEAT_SIZE};
  justify-content: center;
  width: ${EMPTY_SEAT_SIZE};
`;

type OnboardingSkipDialogAvatar = {
  id: string;
  name: string;
  src?: string | null;
  shape: AvatarShape;
};

type OnboardingSkipDialogAvatarsProps = {
  avatars: OnboardingSkipDialogAvatar[];
  emptySeatsCount?: number;
};

export const OnboardingSkipDialogAvatars = ({
  avatars,
  emptySeatsCount = 0,
}: OnboardingSkipDialogAvatarsProps) => {
  const theme = useTheme();

  const visibleAvatars = avatars.slice(0, MAX_VISIBLE_AVATARS);

  return (
    <AvatarGroup
      maxVisible={visibleAvatars.length + emptySeatsCount}
      overlapOffset="4px"
      avatars={[
        ...visibleAvatars.map((avatar, index) => (
          <OnboardingSkipDialogAvatarItem key={avatar.id} index={index}>
            <Avatar
              src={avatar.src}
              name={avatar.name}
              colorSeed={avatar.id}
              size="lg"
              shape={avatar.shape}
              ring
            />
          </OnboardingSkipDialogAvatarItem>
        )),
        ...Array.from({ length: emptySeatsCount }, (_, emptySeatIndex) => (
          <OnboardingSkipDialogAvatarItem
            key={`empty-seat-${emptySeatIndex}`}
            index={visibleAvatars.length + emptySeatIndex}
          >
            <StyledEmptySeat>
              <IconPlus size={theme.icon.size.sm} />
            </StyledEmptySeat>
          </OnboardingSkipDialogAvatarItem>
        )),
      ]}
    />
  );
};
