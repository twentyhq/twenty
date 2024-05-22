import styled from '@emotion/styled';
import { Avatar, Chip, ChipAccent, ChipSize, ChipVariant } from 'twenty-ui';

const useChipN = 'private';


export const EmailThreadMembersChip = () => {
  return (
    <>
      {useChipN === 'private' && (
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
      )}
      {useChipN === 'everyone' && (
        <Chip
          label="Everyone"
          size={ChipSize.Large}
          accent={ChipAccent.TextSecondary}
          variant={ChipVariant.Highlighted}
        />
      )}
      {useChipN === 'shared' && (
        <Chip
          label="Shared With 1 person"
          size={ChipSize.Large}
          accent={ChipAccent.TextSecondary}
          variant={ChipVariant.Highlighted}
        />
      )}
    </>
  );
};
