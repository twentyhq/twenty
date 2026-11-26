import { CHAT_COMPOSER_BOX_GAP } from '@/chat/constants/ChatComposerBoxGap';
import { styled } from '@linaria/react';
import { motion, useReducedMotion } from 'framer-motion';
import { type ReactNode } from 'react';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledClip = styled.div`
  flex-shrink: 0;
  margin-bottom: calc(-1 * ${CHAT_COMPOSER_BOX_GAP});
  overflow: hidden;
`;

const AnimatedClip = motion.create(StyledClip);

const StyledContent = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[1]};
  padding-bottom: ${CHAT_COMPOSER_BOX_GAP};
`;

type ChatComposerAttachmentsProps = {
  hasAttachments: boolean;
  children: ReactNode;
};

export const ChatComposerAttachments = ({
  hasAttachments,
  children,
}: ChatComposerAttachmentsProps) => {
  const theme = useTheme();
  const shouldReduceMotion = useReducedMotion();

  return (
    <AnimatedClip
      initial={false}
      animate={{ height: hasAttachments ? 'auto' : 0 }}
      transition={{
        duration: shouldReduceMotion ? 0 : theme.animation.duration.normal,
      }}
    >
      <StyledContent>{children}</StyledContent>
    </AnimatedClip>
  );
};
