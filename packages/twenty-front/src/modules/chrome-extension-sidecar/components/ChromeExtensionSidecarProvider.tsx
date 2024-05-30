import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { isLoadingTokensFromExtensionState } from '@/chrome-extension-sidecar/states/isLoadingTokensFromExtensionState';
import { chromeExtensionIdState } from '@/client-config/states/chromeExtensionIdState';
import { isDefined } from '~/utils/isDefined';
import { isInFrame } from '~/utils/isInIframe';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
`;

const AppInaccessible = ({ message }: { message: string }) => {
  return (
    <StyledContainer>
      <img
        src="/images/integrations/twenty-logo.svg"
        alt="twenty-icon"
        height={40}
        width={40}
      />
      <h3>{message}</h3>
    </StyledContainer>
  );
};

export const ChromeExtensionSidecarProvider: React.FC<
  React.PropsWithChildren
> = ({ children }) => {
  const isLoadingTokensFromExtension = useRecoilValue(
    isLoadingTokensFromExtensionState,
  );
  const chromeExtensionId = useRecoilValue(chromeExtensionIdState);

  if (!isInFrame()) return <>{children}</>;

  if (!isDefined(chromeExtensionId))
    return (
      <AppInaccessible message={`Twenty is not accessible inside an iframe.`} />
    );

  if (isDefined(isLoadingTokensFromExtension) && !isLoadingTokensFromExtension)
    return (
      <AppInaccessible
        message={`Unauthorized access from iframe origin. If you're trying to access from chrome extension,
      please check your chrome extension ID on your server.
    `}
      />
    );

  return isLoadingTokensFromExtension && <>{children}</>;
};
