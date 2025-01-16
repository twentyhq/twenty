import { useLabsPublicFeatureFlags } from '@/settings/labs/hooks/useLabsPublicFeatureFlags';
import styled from '@emotion/styled';
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
  const { labsPublicFeatureFlags, handleLabsPublicFeatureFlagUpdate } =
    useLabsPublicFeatureFlags();

  const handleToggle = async (key: FeatureFlagKey, value: boolean) => {
    await handleLabsPublicFeatureFlagUpdate(key, value);
  };

  return (
    <StyledContainer>
      {labsPublicFeatureFlags.map((flag) => (
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
