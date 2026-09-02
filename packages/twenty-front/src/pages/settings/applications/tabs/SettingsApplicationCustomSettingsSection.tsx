import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';
import { Section } from 'twenty-ui/layout';

import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledRendererContainer = styled.div`
  display: flex;
  width: 100%;
`;

const StyledSkeletonContainer = styled.div`
  height: 400px;
  width: 100%;
`;

type SettingsApplicationCustomSettingsSectionProps = {
  frontComponentId: string;
};

export const SettingsApplicationCustomSettingsSection = ({
  frontComponentId,
}: SettingsApplicationCustomSettingsSectionProps) => {
  const skeletonFallback = (
    <StyledSkeletonContainer>
      <FrontComponentSkeletonLoader />
    </StyledSkeletonContainer>
  );

  return (
    <Section>
      <StyledRendererContainer>
        <Suspense fallback={skeletonFallback}>
          <FrontComponentRenderer
            frontComponentId={frontComponentId}
            loadingFallback={skeletonFallback}
          />
        </Suspense>
      </StyledRendererContainer>
    </Section>
  );
};
