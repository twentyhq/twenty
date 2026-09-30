import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { AvatarGroup } from 'twenty-ui/components';
import { Avatar, type AvatarShape } from 'twenty-ui/primitives/data-display';

const MAX_VISIBLE_AVATARS = 5;

const StyledItem = styled(motion.div)`
  display: flex;
`;

type OnboardingSkipDialogAvatar = {
  id: string;
  name: string;
  src?: string | null;
  shape: AvatarShape;
};

type OnboardingSkipDialogAvatarsProps = {
  avatars: OnboardingSkipDialogAvatar[];
};

export const OnboardingSkipDialogAvatars = ({
  avatars,
}: OnboardingSkipDialogAvatarsProps) => {
  const shouldReduceMotion = useReducedMotion();

  const visibleAvatars = avatars.slice(0, MAX_VISIBLE_AVATARS);

  return (
    <AvatarGroup
      maxVisible={visibleAvatars.length}
      overlapOffset="4px"
      avatars={visibleAvatars.map((avatar, index) => (
        <StyledItem
          key={avatar.id}
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 22,
            delay: index * 0.05,
          }}
        >
          <Avatar
            src={avatar.src}
            name={avatar.name}
            colorSeed={avatar.id}
            size="lg"
            shape={avatar.shape}
            ring
          />
        </StyledItem>
      ))}
    />
  );
};
