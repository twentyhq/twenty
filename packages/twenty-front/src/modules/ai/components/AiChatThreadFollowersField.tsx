import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconBell, IconBellOff } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatThreadDetailsRow } from '@/ai/components/AiChatThreadDetailsRow';

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
    <AiChatThreadDetailsRow
      Icon={IconBell}
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
    </AiChatThreadDetailsRow>
  );
};
