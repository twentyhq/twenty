import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconArrowRight } from 'twenty-ui';

type EventUpdatePropertyProps = {
  propertyName: string;
  after?: string;
};

const StyledContainer = styled.div`
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
  gap: ${({ theme }) => theme.spacing(1)};
  white-space: nowrap;
`;

const StyledPropertyName = styled.div``;

export const EventUpdateProperty = ({
  propertyName,
  after,
}: EventUpdatePropertyProps) => {
  const theme = useTheme();
  return (
    <StyledContainer>
      <StyledPropertyName>{propertyName}</StyledPropertyName>
      <IconArrowRight size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      {after}
    </StyledContainer>
  );
};
