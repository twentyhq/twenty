import { styled } from '@linaria/react';

import { Tag } from 'twenty-ui/components';
import { IconBuildingSkyscraper } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledViewBar = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  display: flex;
  flex-shrink: 0;
  gap: 8px;
  height: 40px;
  padding: 0 12px;
`;

export const BackgroundMockViewBar = () => {
  return (
    <StyledViewBar>
      <Tag text="All Companies" color="gray" Icon={IconBuildingSkyscraper} />
    </StyledViewBar>
  );
};
