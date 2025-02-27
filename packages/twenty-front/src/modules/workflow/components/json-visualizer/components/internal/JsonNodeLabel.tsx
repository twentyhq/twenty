import styled from '@emotion/styled';
import { IconPlaylistAdd } from 'twenty-ui';

const StyledLabelContainer = styled.span`
  align-items: center;
  border-color: ${({ theme }) => theme.border.color.medium};
  border-width: 1px;
  display: flex;
  padding-block: ${({ theme }) => theme.spacing(1)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  row-gap: ${({ theme }) => theme.spacing(2)};
`;

export const JsonNodeLabel = ({ label }: { label: string }) => {
  return (
    <StyledLabelContainer>
      <IconPlaylistAdd />

      <span>{label}</span>
    </StyledLabelContainer>
  );
};
