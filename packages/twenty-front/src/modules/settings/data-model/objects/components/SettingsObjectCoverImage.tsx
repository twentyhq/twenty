import { styled } from '@linaria/react';

import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye } from 'twenty-ui/display';
import { FloatingButton } from 'twenty-ui/input';

import DarkCoverImage from '@/settings/data-model/assets/cover-dark.png';
import LightCoverImage from '@/settings/data-model/assets/cover-light.png';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledCoverImageContainer = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-sizing: border-box;
  margin-bottom: ${themeCssVariables.spacing[8]};
  min-height: 153px;
  overflow: hidden;
  position: relative;
`;

const StyledCoverImage = styled.img`
  display: block;
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: center;
  position: absolute;
  width: 100%;
`;

const StyledButtonOverlay = styled.div`
  align-items: center;
  display: flex;
  inset: 0;
  justify-content: center;
  pointer-events: none;
  position: absolute;

  & > * {
    pointer-events: auto;
  }
`;
export const SettingsObjectCoverImage = () => {
  const { colorScheme } = useContext(ThemeContext);

  const { t } = useLingui();
  return (
    <StyledCoverImageContainer>
      <StyledCoverImage
        src={
          colorScheme === 'light'
            ? LightCoverImage.toString()
            : DarkCoverImage.toString()
        }
        alt=""
        aria-hidden
      />
      <StyledButtonOverlay>
        <FloatingButton
          Icon={IconEye}
          title={t`Visualize`}
          size="small"
          to={getSettingsPath(SettingsPath.ObjectOverview)}
        />
      </StyledButtonOverlay>
    </StyledCoverImageContainer>
  );
};
