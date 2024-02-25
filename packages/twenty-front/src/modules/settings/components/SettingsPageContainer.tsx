import styled from '@emotion/styled';

import { OBJECT_SETTINGS_WIDTH } from '@/settings/data-model/constants/ObjectSettings';

const StyledSettingsPageContainer = styled.div<{ width?: number }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  overflow: auto;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${({ width }) =>
    width ? width + 'px' : OBJECT_SETTINGS_WIDTH + 'px'};
`;

export { StyledSettingsPageContainer as SettingsPageContainer };
