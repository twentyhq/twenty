import { styled } from '@linaria/react';
import { useContext } from 'react';

import { TopBar } from '@/ui/layout/top-bar/components/TopBar';
import {
  IconBuildingSkyscraper,
  IconChevronDown,
  TintedIconTile,
} from 'twenty-ui/display';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

const StyledViewPicker = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: 100%;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledViewPickerCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
`;

const StyledRightAction = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.regular};
  height: 100%;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

export const BackgroundMockViewBar = () => {
  const { theme } = useContext(ThemeContext);

  return (
    <TopBar
      leftComponent={
        <StyledViewPicker>
          <TintedIconTile Icon={IconBuildingSkyscraper} color="blue" />
          <span>All Companies</span>
          <StyledViewPickerCount>· 599</StyledViewPickerCount>
          <IconChevronDown
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        </StyledViewPicker>
      }
      rightComponent={
        <>
          <StyledRightAction>Filter</StyledRightAction>
          <StyledRightAction>Sort</StyledRightAction>
          <StyledRightAction>Options</StyledRightAction>
        </>
      }
    />
  );
};
