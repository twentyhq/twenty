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
  min-height: 400px;
  width: 100%;
`;

type SettingsApplicationCustomSettingsSectionProps = {
  frontComponentId: string;
};

export const SettingsApplicationCustomSettingsSection = ({
  frontComponentId,
}: SettingsApplicationCustomSettingsSectionProps) => {
  return (
    <Section>
      <StyledRendererContainer>
        <Suspense fallback={<FrontComponentSkeletonLoader />}>
          <FrontComponentRenderer
            frontComponentId={frontComponentId}
            loadingFallback={<FrontComponentSkeletonLoader />}
          />
        </Suspense>
      </StyledRendererContainer>
    </Section>
  );
};
