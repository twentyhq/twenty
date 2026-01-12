import styled from '@emotion/styled';
import { Pill } from 'twenty-ui/components';

export const StyledSSOButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

export const StyledLastUsedPill = styled(Pill)`
  background: ${({ theme }) => theme.color.blue3};
  border: 1px solid ${({ theme }) => theme.color.blue5};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ theme }) => theme.color.blue};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  position: absolute;
  right: -${({ theme }) => theme.spacing(5)};
  top: -${({ theme }) => theme.spacing(2)};
`;
