import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';
import { Section } from 'twenty-ui/components/layout';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledRendererContainer = styled.div`
  display: flex;
  min-height: 400px;
  width: 100%;
`;

type SettingsAppPreferencesApplicationSettingsSectionProps = {
  title: string;
  frontComponentId: string;
};

// A USER-scoped settings menu item: the app renders it the same way it renders
// a workspace settings tab, but as the viewing member, so what it saves is theirs.
export const SettingsAppPreferencesApplicationSettingsSection = ({
  title,
  frontComponentId,
}: SettingsAppPreferencesApplicationSettingsSectionProps) => (
  <Section.Root>
    <Section.Header title={title} />
    <StyledRendererContainer>
      <Suspense fallback={<FrontComponentSkeletonLoader />}>
        <FrontComponentRenderer
          frontComponentId={frontComponentId}
          loadingFallback={<FrontComponentSkeletonLoader />}
        />
      </Suspense>
    </StyledRendererContainer>
  </Section.Root>
);
