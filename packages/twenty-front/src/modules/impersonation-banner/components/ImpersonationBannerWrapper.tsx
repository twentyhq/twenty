import { currentUserState } from '@/auth/states/currentUserState';
import { IMPERSONATION_BANNER_HEIGHT } from '@/impersonation-banner/constants/ImpersonationBannerHeight';
import { getUserName } from '@/impersonation-banner/utils/getUserName';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import { cookieStorage } from '~/utils/cookie-storage';
import { ImpersonationBanner } from './ImpersonationBanner';

const StyledImpersonationBannerWrapper = styled.div`
  height: ${IMPERSONATION_BANNER_HEIGHT};
  position: relative;

  &:empty {
    height: 0;
  }
`;

export const ImpersonationBannerWrapper = () => {
  const hasCookie = isDefined(cookieStorage.getItem('impersonationTokenPair'));
  const isImpersonating = hasCookie;

  const currentUser = useRecoilValue(currentUserState);

  const displayName = getUserName(currentUser);
  const bannerText = `You are impersonating ${displayName}`;

  const handleStopImpersonating = () => {
    cookieStorage.removeItem('impersonationTokenPair');
    window.location.reload();
  };
  const buttonOnClick = isImpersonating ? handleStopImpersonating : undefined;

  if (!isImpersonating) {
    return <StyledImpersonationBannerWrapper />;
  }

  return (
    <StyledImpersonationBannerWrapper>
      <ImpersonationBanner message={bannerText} buttonOnClick={buttonOnClick} />
    </StyledImpersonationBannerWrapper>
  );
};
