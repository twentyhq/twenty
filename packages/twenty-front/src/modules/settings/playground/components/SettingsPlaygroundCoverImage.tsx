import styled from '@emotion/styled';

import DarkCoverImage from '@/settings/playground/assets/cover-dark.png';
import LightCoverImage from '@/settings/playground/assets/cover-light.png';
import { Card } from 'twenty-ui/layout';

export const StyledSettingsApiPlaygroundCoverImage = styled(Card)`
  align-items: center;
  background-image: ${({ theme }) =>
    theme.name === 'light'
      ? `url('${LightCoverImage.toString()}')`
      : `url('${DarkCoverImage.toString()}')`};
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  height: 153px;
  justify-content: center;
  position: relative;
  margin-top: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;
