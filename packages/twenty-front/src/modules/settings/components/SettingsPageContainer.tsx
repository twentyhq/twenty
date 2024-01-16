import styled from '@emotion/styled';

import { objectSettingsWidth } from '../data-model/constants/objectSettings';

const StyledSettingsPageContainer = styled.div<{ width?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${({ width, theme }) =>
    width
      ? width + 'px'
      : parseInt(objectSettingsWidth) - parseInt(theme.spacing(8)) + 'px'};
`;

export { StyledSettingsPageContainer as SettingsPageContainer };
