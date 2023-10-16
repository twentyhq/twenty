import styled from '@emotion/styled';

import { objectSettingsWidth } from '../data-model/constants/objectSettings';

const StyledSettingsPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  height: fit-content;
  padding: ${({ theme }) => theme.spacing(8)};
  width: ${objectSettingsWidth};
`;

export { StyledSettingsPageContainer as SettingsPageContainer };
