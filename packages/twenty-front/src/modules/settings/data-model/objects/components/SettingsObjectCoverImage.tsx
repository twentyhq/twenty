import styled from '@emotion/styled';

import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye } from 'twenty-ui/display';
import { FloatingButton } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';

import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';

const StyledCoverImageContainer = styled(Card)`
  align-items: center;
  background-image: ${({ theme }) =>
    theme.name === 'light'
      ? `url('${LightCoverImage.toString()}')`
      : `url('${DarkCoverImage.toString()}')`};
  background-size: cover;
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-sizing: border-box;
  display: flex;
  min-height: 153px;
  justify-content: center;
  position: relative;
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledButtonContainer = styled.div`
  padding-top: ${({ theme }) => theme.spacing(5)};
`;
export const SettingsObjectCoverImage = () => {
  const { t } = useLingui();
  return (
    <StyledCoverImageContainer>
      <StyledButtonContainer>
        <FloatingButton
          Icon={IconEye}
          title={t`Visualize`}
          size="small"
          to={getSettingsPath(SettingsPath.ObjectOverview)}
        />
      </StyledButtonContainer>
    </StyledCoverImageContainer>
  );
};
