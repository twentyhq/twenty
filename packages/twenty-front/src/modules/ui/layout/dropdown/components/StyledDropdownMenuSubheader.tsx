import styled from '@emotion/styled';
import { Label } from 'twenty-ui';

export const StyledDropdownMenuSubheader = styled(Label)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
  padding: ${({ theme }) => `${theme.spacing(1)} ${theme.spacing(2)}`};
  width: 100%;
`;

export const DropdownMenuSubheader = (
  props: React.ComponentProps<typeof StyledDropdownMenuSubheader>,
  // eslint-disable-next-line react/jsx-props-no-spreading
) => <StyledDropdownMenuSubheader variant="small" {...props} />;
