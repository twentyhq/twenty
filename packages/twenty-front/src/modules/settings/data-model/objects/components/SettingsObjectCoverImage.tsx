import { styled } from '@linaria/react';

import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye } from 'twenty-ui/display';
import { FloatingButton } from 'twenty-ui/input';
import { Card } from 'twenty-ui/layout';

import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCoverImageContainer = styled(Card)`
  align-items: center;
  background-size: cover;
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  display: flex;
  min-height: 153px;
  justify-content: center;
  position: relative;
  margin-bottom: ${themeCssVariables.spacing[8]};
`;

const StyledButtonContainer = styled.div`
  padding-top: ${themeCssVariables.spacing[5]};
`;
export const SettingsObjectCoverImage = () => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  return (
    <StyledCoverImageContainer
      style={{
        backgroundImage:
          theme.name === 'light'
            ? `url('${LightCoverImage.toString()}')`
            : `url('${DarkCoverImage.toString()}')`,
      }}
    >
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
