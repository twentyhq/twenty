import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useLabPublicFeatureFlags } from '@/settings/lab/hooks/useLabPublicFeatureFlags';
import styled from '@emotion/styled';
import { useState } from 'react';
import { useRecoilValue } from 'recoil';
import { Card } from 'twenty-ui/layout';
import { type FeatureFlagKey } from '~/generated/graphql';

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(4)};
  grid-template-columns: 1fr;
`;

const StyledImage = styled.img`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  height: 120px;
  width: 100%;
  object-fit: cover;
  display: flex;
`;

export const SettingsLabContent = () => {
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { labPublicFeatureFlags, handleLabPublicFeatureFlagUpdate } =
    useLabPublicFeatureFlags();
  const [hasImageLoadingError, setHasImageLoadingError] = useState<
    Record<string, boolean>
  >({});

  const handleToggle = async (key: FeatureFlagKey, value: boolean) => {
    await handleLabPublicFeatureFlagUpdate(key, value);
  };

  const handleImageError = (key: string) => {
    setHasImageLoadingError((prev) => ({ ...prev, [key]: true }));
  };

  return (
    currentWorkspace?.id && (
      <StyledCardGrid>
        {[...labPublicFeatureFlags]
          .sort((a, b) => {
            // Sort flags with images first
            if (a.metadata.imagePath !== '' && b.metadata.imagePath === '')
              return -1;
            if (a.metadata.imagePath === '' && b.metadata.imagePath !== '')
              return 1;
            return 0;
          })
          .map((flag) => (
            <Card key={flag.key} rounded>
              {flag.metadata.imagePath && !hasImageLoadingError[flag.key] ? (
                <StyledImage
                  src={flag.metadata.imagePath}
                  alt={flag.metadata.label}
                  onError={() => handleImageError(flag.key)}
                />
              ) : (
                <></>
              )}
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
    )
  );
};
