import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { AvatarGroup } from 'twenty-ui/components';
import { Avatar, type AvatarShape } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

const MAX_VISIBLE_AVATARS = 5;

const StyledItem = styled(motion.div)`
  display: flex;
`;

const StyledAvatar = styled(Avatar)`
  && {
    box-shadow:
      0 0 0 1px ${themeCssVariables.border.color.light},
      0 0 0 2px ${themeCssVariables.background.primary};
  }
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

  const items = avatars
    .slice(0, MAX_VISIBLE_AVATARS)
    .map((avatar) => (
      <StyledAvatar
        key={avatar.id}
        src={avatar.src}
        name={avatar.name}
        colorSeed={avatar.id}
        size="lg"
        shape={avatar.shape}
      />
    ));

  return (
    <AvatarGroup
      maxVisible={items.length}
      overlapOffset="4px"
      avatars={items.map((item, index) => (
        <StyledItem
          key={item.key}
          initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.6 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 22,
            delay: index * 0.05,
          }}
        >
          {item}
        </StyledItem>
      ))}
    />
  );
};
