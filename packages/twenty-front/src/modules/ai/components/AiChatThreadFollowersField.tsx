import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { DetailsRow } from 'twenty-ui/components/data-display';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconBellOff } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX } from '@/ai/constants/AiChatThreadDetailsLabelWidthInPx';

const StyledEmptyValue = styled.span`
  color: ${themeCssVariables.font.color.light};
  font-size: ${themeCssVariables.font.size.sm};
`;

type AiChatThreadFollowersFieldProps = {
  followers: { id: string; name: string; avatarUrl?: string | null }[];
  isFollowing: boolean;
  isSaving?: boolean;
  onFollowingChange?: (isFollowing: boolean) => void;
};

export const AiChatThreadFollowersField = ({
  followers,
  isFollowing,
  isSaving = false,
  onFollowingChange,
}: AiChatThreadFollowersFieldProps) => {
  const { t } = useLingui();
  const actionLabel = isFollowing ? t`Unfollow for me` : t`Follow for me`;
  const ActionIcon = isFollowing ? IconBellOff : IconBell;

  return (
    <DetailsRow
      labelWidth={AI_CHAT_THREAD_DETAILS_LABEL_WIDTH_IN_PX}
      startIcon={<IconBell size={themeCssVariables.icon.size.md} />}
      label={t`Following`}
      action={
        isDefined(onFollowingChange) && (
          <LightIconButton
            aria-label={actionLabel}
            title={actionLabel}
            disabled={isSaving}
            emphasis="subtle"
            onClick={() => onFollowingChange(!isFollowing)}
          >
            <ActionIcon />
          </LightIconButton>
        )
      }
    >
      {isNonEmptyArray(followers) ? (
        followers.map(({ id, name, avatarUrl }) => (
          <Chip
            key={id}
            variant="soft"
            startElement={
              <Avatar name={name} src={avatarUrl} size="sm" shape="circle" />
            }
          >
            {name}
          </Chip>
        ))
      ) : (
        <StyledEmptyValue>{t`None`}</StyledEmptyValue>
      )}
    </DetailsRow>
  );
};
