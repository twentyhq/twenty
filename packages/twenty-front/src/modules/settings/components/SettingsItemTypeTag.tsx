import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import {
  getItemTagInfo,
  type ItemTagInfo,
} from '@/settings/data-model/utils/getItemTagInfo';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

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

const StyledIconContainer = styled.div<{
  labelColor: ItemTagInfo['labelColor'];
}>`
  align-items: center;
  background: ${({ theme, labelColor }) => theme.tag.background[labelColor]};
  border: 1px solid ${({ theme, labelColor }) => theme.color[labelColor + '4']};
  border-radius: 3px;
  box-sizing: border-box;
  color: ${({ theme, labelColor }) => theme.tag.text[labelColor]};
  display: flex;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  height: 16px;
  justify-content: center;
  width: 16px;
`;

export const SettingsItemTypeTag = ({
  className,
  item: { isCustom, isRemote, applicationId },
}: SettingsItemTypeTagProps) => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const itemTagInfo = getItemTagInfo({
    item: { isCustom, isRemote, applicationId },
    workspaceCustomApplicationId:
      currentWorkspace?.workspaceCustomApplication?.id,
  });

  return (
    <StyledContainer className={className}>
      <StyledIconContainer labelColor={itemTagInfo.labelColor}>
        {itemTagInfo.labelText.charAt(0).toUpperCase()}
      </StyledIconContainer>
      {itemTagInfo.labelText}
    </StyledContainer>
  );
};
