import { type SettingsApplicationConnectedMember } from '@/settings/applications/types/SettingsApplicationConnectedMember';
import { getApplicationConnectedMemberName } from '@/settings/applications/utils/getApplicationConnectedMemberName';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

export const SettingsApplicationConnectedMemberNameCell = ({
  item: connectedMember,
}: {
  item: SettingsApplicationConnectedMember;
}) => {
  const name = getApplicationConnectedMemberName(connectedMember);

  return (
    <StyledContainer>
      <Avatar
        src={getAbsoluteImageUrl(connectedMember.workspaceMember?.avatarUrl)}
        colorSeed={
          connectedMember.workspaceMember?.id ?? connectedMember.userId
        }
        name={name}
        shape="circle"
        size="md"
      />
      <OverflowingTextWithTooltip text={name} />
    </StyledContainer>
  );
};
