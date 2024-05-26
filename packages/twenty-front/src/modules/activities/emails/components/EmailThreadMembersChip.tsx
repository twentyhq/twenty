import { Avatar, Chip, ChipAccent, ChipSize, ChipVariant } from 'twenty-ui';

export const EmailThreadMembersChip = ({
  member = 'private',
}: {
  member?: 'private' | 'everyone' | 'shared';
}) => {
  const renderChip = () => {
    switch (member) {
      case 'private':
        return (
          <Chip
            label="Private"
            leftComponent={
              <Avatar
                avatarUrl="https://upload.wikimedia.org/wikipedia/commons/thumb/5/59/User-avatar.svg/2048px-User-avatar.svg.png"
                placeholder="private"
              />
            }
            size={ChipSize.Large}
            accent={ChipAccent.TextSecondary}
            variant={ChipVariant.Highlighted}
          />
        );
      case 'everyone':
        return (
          <Chip
            label="Everyone"
            size={ChipSize.Large}
            accent={ChipAccent.TextSecondary}
            variant={ChipVariant.Highlighted}
          />
        );
      case 'shared':
        return (
          <Chip
            label="Shared With 1 person"
            size={ChipSize.Large}
            accent={ChipAccent.TextSecondary}
            variant={ChipVariant.Highlighted}
          />
        );
      default:
        return null;
    }
  };

  return <>{renderChip()} </>;
};
