import { SKELETON_LOADER_HEIGHT_SIZES } from '@/activities/components/SkeletonLoader';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { SettingsPageHeader } from '@/settings/components/layout/SettingsPageHeader';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

// Full-page settings loading state: the rounded-card chrome (header + body)
// wrapped around the shared SettingsSectionSkeletonLoader.
//
// Use this only when no settings chrome is on screen yet — the route-level
// Suspense fallback, or a page that must load its data (and its data-dependent
// title/breadcrumb) before it can render SettingsPageLayout. When the chrome is
// already rendered above (e.g. a tab inside an already-rendered page), render
// SettingsSectionSkeletonLoader directly so the body matches without nesting a
// second card.
//
// The card is re-created here rather than reusing SettingsPageLayout to keep the
// skeleton free of the layout's page-level side effects (command-menu hotkeys,
// the desktop side panel and the information banner).
const StyledRoot = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1;
  min-height: 0;
  min-width: 0;
  padding: ${({ isMobile }) =>
    isMobile ? themeCssVariables.spacing[1] : themeCssVariables.spacing[2]};
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
  const isMobile = useIsMobile();
  const { theme } = useContext(ThemeContext);

  return (
    <StyledRoot isMobile={isMobile}>
      <StyledCard>
        <SkeletonTheme
          baseColor={theme.background.tertiary}
          highlightColor={theme.background.transparent.lighter}
          borderRadius={4}
        >
          <SettingsPageHeader
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
