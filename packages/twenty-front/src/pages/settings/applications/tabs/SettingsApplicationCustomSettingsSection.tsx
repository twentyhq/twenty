import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { FrontComponentSkeletonLoader } from '@/front-components/components/FrontComponentSkeletonLoader';
import { Section } from 'twenty-ui/components';

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
    <Section.Root>
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
