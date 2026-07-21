import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useLabPublicFeatureFlags } from '@/settings/lab/hooks/useLabPublicFeatureFlags';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useState } from 'react';
import {
  IconCalendarWeek,
  IconRelationManyToMany,
  IconSparkles,
  type IconComponent,
} from 'twenty-ui/icon';
import { Card } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledCardGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[4]};
  grid-template-columns: 1fr;
`;

const StyledImage = styled.img`
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
  display: flex;
  height: 120px;
  object-fit: cover;
  width: 100%;
`;

const labFeatureFlagIcons: Partial<Record<FeatureFlagKey, IconComponent>> = {
  [FeatureFlagKey.IS_CALENDAR_WEEK_VIEW_ENABLED]: IconCalendarWeek,
  [FeatureFlagKey.IS_JUNCTION_RELATIONS_ENABLED]: IconRelationManyToMany,
  [FeatureFlagKey.IS_SETTINGS_DISCOVERY_HERO_ENABLED]: IconSparkles,
};

export const SettingsLabContent = () => {
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
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

  const labPublicFeatureFlagsWithImage = labPublicFeatureFlags.filter((flag) =>
    isNonEmptyString(flag.metadata.imagePath),
  );
  const labPublicFeatureFlagsWithoutImage = labPublicFeatureFlags.filter(
    (flag) => !isNonEmptyString(flag.metadata.imagePath),
  );

  return (
    currentWorkspace?.id && (
      <StyledCardGrid>
        {labPublicFeatureFlagsWithImage.map((flag) => (
          <Card
            key={flag.key}
            rounded
            backgroundColor={themeCssVariables.background.secondary}
          >
            {!hasImageLoadingError[flag.key] && (
              <StyledImage
                src={flag.metadata.imagePath ?? undefined}
                alt={flag.metadata.label}
                onError={() => handleImageError(flag.key)}
              />
            )}
            <SettingsOptionCardContentToggle
              Icon={labFeatureFlagIcons[flag.key]}
              title={flag.metadata.label}
              description={flag.metadata.description}
              checked={flag.value}
              onChange={(value) => handleToggle(flag.key, value)}
              toggleCentered={false}
            />
          </Card>
        ))}

        {labPublicFeatureFlagsWithoutImage.length > 0 && (
          <Card
            rounded
            backgroundColor={themeCssVariables.background.secondary}
          >
            {labPublicFeatureFlagsWithoutImage.map((flag, index) => (
              <SettingsOptionCardContentToggle
                key={flag.key}
                Icon={labFeatureFlagIcons[flag.key]}
                title={flag.metadata.label}
                description={flag.metadata.description}
                checked={flag.value}
                onChange={(value) => handleToggle(flag.key, value)}
                toggleCentered={false}
                divider={index < labPublicFeatureFlagsWithoutImage.length - 1}
              />
            ))}
          </Card>
        )}
      </StyledCardGrid>
    )
  );
};
