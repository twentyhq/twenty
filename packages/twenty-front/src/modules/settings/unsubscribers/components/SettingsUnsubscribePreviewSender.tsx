import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';

import { getWorkspaceAvatarColorSeed } from '@/workspace/utils/getWorkspaceAvatarColorSeed';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledSender = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

type SettingsUnsubscribePreviewSenderProps = {
  workspaceName: string | null | undefined;
  workspaceLogo: string | null | undefined;
};

export const SettingsUnsubscribePreviewSender = ({
  workspaceName,
  workspaceLogo,
}: SettingsUnsubscribePreviewSenderProps) => {
  if (!isNonEmptyString(workspaceName) && !isNonEmptyString(workspaceLogo)) {
    return null;
  }

  return (
    <StyledSender>
      {isNonEmptyString(workspaceLogo) && (
        <Avatar
          name={workspaceName ?? ''}
          colorSeed={getWorkspaceAvatarColorSeed(workspaceName)}
          src={getAbsoluteImageUrl(workspaceLogo)}
          shape="square"
          size="lg"
        />
      )}
      {workspaceName}
    </StyledSender>
  );
};
