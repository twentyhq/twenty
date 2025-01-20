import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useLabPublicFeatureFlags } from '@/settings/lab/hooks/useLabPublicFeatureFlags';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { Card, MOBILE_VIEWPORT } from 'twenty-ui';
import { FeatureFlagKey } from '~/generated/graphql';

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: 1fr;

  & > *:not(:first-child) {
    grid-column: span 1;
  }

  @media (min-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: repeat(2, 1fr);

    & > *:first-child {
      grid-column: 1 / -1;
    }
  }
`;

const StyledFlagImage = styled.img<{ isFirstCard: boolean }>`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  height: ${({ isFirstCard }) => (isFirstCard ? '240px' : '120px')};
  object-fit: cover;
  width: 100%;
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
    <StyledCardGrid>
      {labPublicFeatureFlags.map((flag, index) => (
        <Card key={flag.key} rounded>
          <StyledFlagImage
            src={flag.metadata.imagePath ?? ''}
            alt={flag.metadata.label}
            isFirstCard={index === 0}
          />
          <SettingsOptionCardContentToggle
            title={flag.metadata.label}
            description={flag.metadata.description}
            checked={flag.value}
            onChange={(value) => handleToggle(flag.key, value)}
            toggleCentered={false}
          />
        </Card>
      ))}
    </StyledCardGrid>
  );
};
