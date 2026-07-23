import { styled } from '@linaria/react';
import { Avatar, type AvatarSize } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

type WelcomePersonChipSizeVariant = 'default' | 'compact';

const StyledChip = styled.div<{ sizeVariant: WelcomePersonChipSizeVariant }>`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${({ sizeVariant }) =>
    sizeVariant === 'compact'
      ? themeCssVariables.border.radius.sm
      : themeCssVariables.border.radius.md};
  display: inline-flex;
  gap: ${({ sizeVariant }) =>
    sizeVariant === 'compact'
      ? themeCssVariables.spacing[1]
      : themeCssVariables.spacing[2]};
  padding: ${({ sizeVariant }) =>
    sizeVariant === 'compact'
      ? `${themeCssVariables.spacing['0.5']} ${themeCssVariables.spacing[1]}`
      : `${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]}`};
`;

const StyledPersonName = styled.span`
  color: ${themeCssVariables.font.color.primary};
  max-width: min(40vw, 360px);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type WelcomePersonChipProps = {
  avatarSize?: AvatarSize;
  sizeVariant?: WelcomePersonChipSizeVariant;
};

export const WelcomePersonChip = ({
  avatarSize = 'lg',
  sizeVariant = 'default',
}: WelcomePersonChipProps) => {
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const firstName = currentWorkspaceMember?.name?.firstName ?? '';
  const lastName = currentWorkspaceMember?.name?.lastName ?? '';
  const fullName = `${firstName} ${lastName}`.trim();

  return (
    <StyledChip sizeVariant={sizeVariant}>
      <Avatar
        type="rounded"
        size={avatarSize}
        placeholder={fullName}
        placeholderColorSeed={currentWorkspaceMember?.id}
        avatarUrl={getAbsoluteImageUrl(currentWorkspaceMember?.avatarUrl)}
      />
      <StyledPersonName>{fullName}</StyledPersonName>
    </StyledChip>
  );
};
