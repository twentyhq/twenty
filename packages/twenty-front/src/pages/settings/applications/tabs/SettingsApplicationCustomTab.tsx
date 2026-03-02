import styled from '@emotion/styled';
import { Suspense, lazy } from 'react';

const FrontComponentRenderer = lazy(() =>
  import('@/front-components/components/FrontComponentRenderer').then(
    (module) => ({ default: module.FrontComponentRenderer }),
  ),
);

const StyledContainer = styled.div`
  height: 100%;
  overflow: auto;
  width: 100%;
`;

type SettingsApplicationCustomTabProps = {
  settingsCustomTabFrontComponentId: string;
};

export const SettingsApplicationCustomTab = ({
  settingsCustomTabFrontComponentId,
}: SettingsApplicationCustomTabProps) => {
  return (
    <StyledContainer>
      <Suspense fallback={null}>
        <FrontComponentRenderer
          frontComponentId={settingsCustomTabFrontComponentId}
        />
      </Suspense>
    </StyledContainer>
  );
};
