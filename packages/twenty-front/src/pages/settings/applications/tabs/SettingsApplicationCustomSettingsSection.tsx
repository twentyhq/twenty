import { styled } from '@linaria/react';
import { Suspense, lazy } from 'react';

import { Section } from 'twenty-ui/components/layout';

import { SettingsApplicationCustomSettingsSkeletonLoader } from '~/pages/settings/applications/components/SettingsApplicationCustomSettingsSkeletonLoader';

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
        <Suspense
          fallback={<SettingsApplicationCustomSettingsSkeletonLoader />}
        >
          <FrontComponentRenderer
            frontComponentId={frontComponentId}
            loadingFallback={
              <SettingsApplicationCustomSettingsSkeletonLoader />
            }
          />
        </Suspense>
      </StyledRendererContainer>
    </Section.Root>
  );
};
