import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { PageCardHeader } from '@/ui/layout/page/components/PageCardHeader';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRoot = styled.div`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
`;

const StyledCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
  width: 100%;
`;

export const SettingsSkeletonLoader = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRoot>
      <StyledCard>
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          <PageCardHeader
            links={[
              {
                children: (
                  <Skeleton
                    width={64}
                    height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
                  />
                ),
              },
            ]}
            title={
              <Skeleton
                width={120}
                height={SKELETON_LOADER_HEIGHT_SIZES.standard.s}
              />
            }
          />
          <SettingsPageContainer>
            <SettingsSectionSkeletonLoader />
          </SettingsPageContainer>
        </SkeletonTheme>
      </StyledCard>
    </StyledRoot>
  );
};
