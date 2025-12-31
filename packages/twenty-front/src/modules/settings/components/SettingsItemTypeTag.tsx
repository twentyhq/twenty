import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { getItemTagInfo } from '@/settings/data-model/utils/getItemTagInfo';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Avatar } from 'twenty-ui/display';

type SettingsItemTypeTagProps = {
  item: {
    isCustom?: boolean;
    isRemote?: boolean;
    applicationId?: string | null;
  };
  className?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsItemTypeTag = ({
  className,
  item: { isCustom, isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  const theme = useTheme();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const itemTagInfo = getItemTagInfo({
    item: { isCustom, isRemote, applicationId },
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  return (
    <StyledContainer className={className}>
      <Avatar
        placeholder={itemTagInfo.labelText}
        placeholderColorSeed={itemTagInfo.labelText}
        type="squared"
        size="xs"
        color={theme.tag.text[itemTagInfo.labelColor]}
        backgroundColor={theme.tag.background[itemTagInfo.labelColor]}
      />
      {itemTagInfo.labelText}
    </StyledContainer>
  );
};
