import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { AvatarGroup } from 'twenty-ui/components/data-display';
import { IconShare } from 'twenty-ui/icon';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const MAX_VISIBLE_ACCESS_MEMBERS = 3;

type AiChatThreadShareButtonProps = {
  accessMembers?: {
    id: string;
    name: string;
    avatarUrl?: string | null;
  }[];
  onClick: () => void;
  label?: string;
  accessibleLabel?: string;
  disabled?: boolean;
  loading?: boolean;
  shortcut?: string[];
};

export const AiChatThreadShareButton = ({
  accessMembers = [],
  onClick,
  label,
  accessibleLabel,
  disabled = false,
  loading = false,
  shortcut,
}: AiChatThreadShareButtonProps) => {
  const { t } = useLingui();
  const getStartIcon = () => {
    if (!isNonEmptyArray(accessMembers)) {
      return <IconShare />;
    }

    return (
      <AvatarGroup
        render={<span />}
        maxVisible={MAX_VISIBLE_ACCESS_MEMBERS}
        overlapOffset={themeCssVariables.spacing[1]}
        overflowShape="circle"
        avatars={accessMembers.map(({ id, name, avatarUrl }) => (
          <Avatar
            key={id}
            colorSeed={id}
            name={name}
            src={avatarUrl}
            size="sm"
            shape="circle"
            ring
          />
        ))}
      />
    );
  };

  return (
    <Button
      aria-label={accessibleLabel ?? t`Share`}
      size="sm"
      variant="outline"
      disabled={disabled}
      loading={loading}
      shortcut={shortcut}
      onClick={onClick}
      startIcon={getStartIcon()}
    >
      {label ?? t`Share`}
    </Button>
  );
};
