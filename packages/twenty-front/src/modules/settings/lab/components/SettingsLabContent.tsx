import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLabPublicFeatureFlags } from '@/settings/lab/hooks/useLabPublicFeatureFlags';
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
  gap: ${({ theme }) => theme.spacing(4)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledFlagContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledFlagImage = styled.img`
  border-radius: ${({ theme }) => theme.border.radius.sm};
  height: 48px;
  object-fit: cover;
  width: 48px;
`;

const StyledFlagInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledFlagName = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledFlagDescription = styled.span`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: ${({ theme }) => theme.font.size.sm};
`;

export const SettingsLabContent = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { labPublicFeatureFlags, handleLabPublicFeatureFlagUpdate } =
    useLabPublicFeatureFlags();

  const handleToggle = async (key: FeatureFlagKey, value: boolean) => {
    if (!currentWorkspace?.id) return;
    await handleLabPublicFeatureFlagUpdate(key, value);
  };

  return (
    <StyledContainer>
      {labPublicFeatureFlags.map((flag) => (
        <StyledFlagContainer key={flag.key}>
          <StyledFlagContent>
            <StyledFlagImage
              src={flag.metadata.imageUrl}
              alt={flag.metadata.label}
            />
            <StyledFlagInfo>
              <StyledFlagName>{flag.metadata.label}</StyledFlagName>
              <StyledFlagDescription>
                {flag.metadata.description}
              </StyledFlagDescription>
            </StyledFlagInfo>
          </StyledFlagContent>
          <Toggle
            value={flag.value}
            onChange={(value) => handleToggle(flag.key, value)}
          />
        </StyledFlagContainer>
      ))}
    </StyledContainer>
  );
};
