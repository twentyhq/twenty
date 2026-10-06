import { AppChip } from '@/applications/components/AppChip';
import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
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

type SettingsAppPreferencesApplicationSectionProps = {
  applicationId: string;
  applicationName: string;
  applicationLogoUrl?: string | null;
  title: string;
  frontComponentId: string;
};

// A USER-scoped settings menu item: the app renders it the same way it renders
// a workspace settings tab, but as the viewing member, so what it saves is theirs.
export const SettingsAppPreferencesApplicationSection = ({
  applicationId,
  applicationName,
  applicationLogoUrl,
  title,
  frontComponentId,
}: SettingsAppPreferencesApplicationSectionProps) => {
  const { t } = useLingui();

  return (
    <Section.Root>
      <Section.Header
        title={title}
        description={t`Your own ${applicationName} preferences. Only you see what you set here.`}
        adornment={
          <AppChip
            applicationId={applicationId}
            logoUrl={applicationLogoUrl}
            fallbackApplicationData={{ name: applicationName }}
            size="md"
            chipOnly
          />
        }
      />
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
};
