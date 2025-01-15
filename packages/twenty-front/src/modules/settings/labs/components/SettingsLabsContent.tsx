import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useFeatureFlagsManagement } from '@/settings/admin-panel/hooks/useFeatureFlagsManagement';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Toggle } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(4)};
`;

const StyledFlagContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledFlagName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const SettingsLabsContent = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { handleFeatureFlagUpdate } = useFeatureFlagsManagement();

  const publicFlags =
    currentWorkspace?.featureFlags?.filter((flag) => flag.isPublic) ?? [];

  const handleToggle = async (key: FeatureFlagKey, value: boolean) => {
    if (!currentWorkspace?.id) return;

    await handleFeatureFlagUpdate(currentWorkspace.id, key, value, true);
  };

  return (
    <StyledContainer>
      {publicFlags.map((flag) => (
        <StyledFlagContainer key={flag.key}>
          <StyledFlagName>{flag.key}</StyledFlagName>
          <Toggle
            value={flag.value}
            onChange={(value) => handleToggle(flag.key, value)}
          />
        </StyledFlagContainer>
      ))}
    </StyledContainer>
  );
};
