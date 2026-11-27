import { LazyFrontComponentRenderer } from '@/front-components/components/LazyFrontComponentRenderer';
import { styled } from '@linaria/react';
import { Suspense } from 'react';

import { SettingsSectionSkeletonLoader } from '@/settings/components/SettingsSectionSkeletonLoader';
import { Section } from 'twenty-ui/components/layout';

const SKELETON_ROW_COUNT = 5;

const StyledRendererContainer = styled.div`
  display: flex;
  min-height: 400px;
  width: 100%;
`;

type SettingsApplicationCustomSettingsSectionProps = {
  frontComponentId: string;
};

export const SettingsApplicationCustomSettingsSection = ({
  frontComponentId,
}: SettingsApplicationCustomSettingsSectionProps) => {
  const loadingFallback = (
    <SettingsSectionSkeletonLoader hasHeader rowCount={SKELETON_ROW_COUNT} />
  );

  return (
    <Section.Root>
      <StyledRendererContainer>
        <Suspense fallback={loadingFallback}>
          <LazyFrontComponentRenderer
            hostInstanceId="settings-application-custom-settings"
            frontComponentId={frontComponentId}
            loadingFallback={loadingFallback}
          />
        </Suspense>
      </StyledRendererContainer>
    </Section.Root>
  );
};
