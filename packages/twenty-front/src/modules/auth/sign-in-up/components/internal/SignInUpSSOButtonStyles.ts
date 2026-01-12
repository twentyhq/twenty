import styled from '@emotion/styled';
import { Pill } from 'twenty-ui/components';

export const StyledSSOButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledLastUsedPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.font.color.inverted};
  position: absolute;
  right: -${({ theme }) => theme.spacing(2)};
  top: -${({ theme }) => theme.spacing(2)};
`;
