import styled from '@emotion/styled';
import { Label } from 'twenty-ui';

const StyledSelectContainer = styled(Label)`
  display: flex;
  width: calc(100% - ${({ theme }) => theme.spacing(2)});
  margin: ${({ theme }) => theme.spacing(1)};
  user-select: none;
`;

export { StyledSelectContainer as ViewPickerSelectContainer };
