import styled from '@emotion/styled';
import { IconButton } from 'twenty-ui/input';

export const StyledSigneeContainer = styled.div`
  align-items: flex-start;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

export const StyledDeleteSigneeButton = styled(IconButton)`
  margin-top: ${({ theme }) => theme.spacing(5)};
`;

export const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin-bottom: -${({ theme }) => theme.spacing(2)};
`;

export const StyledDescription = styled.p`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
`;
