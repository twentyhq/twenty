import styled from '@emotion/styled';

import DarkCoverImage from '@/billing/assets/cover-dark.png';
import LightCoverImage from '@/billing/assets/cover-light.png';

const StyledCoverImageContainer = styled.div`
  align-items: center;
  background-image: ${({ theme }) =>
    theme.name === 'light'
      ? `url('${LightCoverImage.toString()}')`
      : `url('${DarkCoverImage.toString()}')`};
  background-size: contain;
  background-repeat: no-repeat;
  box-sizing: border-box;
  display: flex;
  height: 162px;
  justify-content: center;
  position: relative;
`;
export const SettingsBillingCoverImage = () => {
  return <StyledCoverImageContainer />;
};
