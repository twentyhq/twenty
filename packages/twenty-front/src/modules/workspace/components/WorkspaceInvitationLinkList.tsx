import { EASE_OUT } from '@/ui/theme/constants/EaseOut';
import { TooltipDelay } from '@/ui/layout/tooltip/constants/TooltipDelay';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion, useReducedMotion } from 'framer-motion';
import { IconButton } from 'twenty-ui/components/input';
import { IconCopy, IconMail } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
import { type WorkspaceInvitationLink } from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const ROW_ENTER_OFFSET_PX = 6;
const ROW_STAGGER_SECONDS = 0.06;

const StyledContainer = styled(motion.div)`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  margin-bottom: ${themeCssVariables.spacing[3]};
  overflow: hidden;
`;

const StyledDescription = styled.div`
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled(motion.div)`
  align-items: center;
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr) auto;
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};

  & + & {
    border-top: 1px solid ${themeCssVariables.border.color.light};
  }
`;

const StyledEmail = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledEllipsis = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledLink = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  user-select: all;
  white-space: nowrap;
`;

type WorkspaceInvitationLinkListProps = {
  inviteLinks: WorkspaceInvitationLink[];
};

export const WorkspaceInvitationLinkList = ({
  inviteLinks,
}: WorkspaceInvitationLinkListProps) => {
  const theme = useTheme();
  const { t } = useLingui();
  const { copyToClipboard } = useCopyToClipboard();
  const shouldReduceMotion = useReducedMotion();
  const rowEnterOffset = shouldReduceMotion ? 0 : ROW_ENTER_OFFSET_PX;

  return (
    <StyledContainer
      data-chromatic="ignore"
      initial={{ opacity: 0, y: -rowEnterOffset }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: theme.animation.duration.fast, ease: EASE_OUT }}
    >
      <StyledDescription>
        {t`Share each link with its invitee. A link only works for the email it was generated for.`}
      </StyledDescription>
      {inviteLinks.map(({ email, link }, index) => (
        <StyledRow
          key={link}
          initial={{ opacity: 0, y: -rowEnterOffset }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: shouldReduceMotion ? 0 : (index + 1) * ROW_STAGGER_SECONDS,
            duration: theme.animation.duration.fast,
            ease: EASE_OUT,
          }}
        >
          <StyledEmail>
            <IconMail size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
            <StyledEllipsis>{email}</StyledEllipsis>
          </StyledEmail>
          <Tooltip
            content={link}
            side="top"
            positionMethod="fixed"
            delay={TooltipDelay.shortDelay}
          >
            <StyledLink>{link}</StyledLink>
          </Tooltip>
          <IconButton
            aria-label={t`Copy invitation link`}
            onClick={() => {
              copyToClipboard(link, t`Link copied to clipboard`);
            }}
            variant="ghost"
            size="md"
          >
            <IconCopy />
          </IconButton>
        </StyledRow>
      ))}
    </StyledContainer>
  );
};
