import { ReactNode } from 'react';
import styled from '@emotion/styled';
import { Card, CardContent } from 'twenty-ui';

type SettingsDataModelPreviewFormCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
};

const StyledPreviewContainer = styled(CardContent)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.extraLight};
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledFormContainer = styled(CardContent)`
  padding: 0;
`;

export const SettingsDataModelPreviewFormCard = ({
  className,
  preview,
  form,
}: SettingsDataModelPreviewFormCardProps) => (
  <Card className={className} fullWidth>
    <StyledPreviewContainer divider={!!form}>
      <StyledTitle>Preview</StyledTitle>
      {preview}
    </StyledPreviewContainer>
    {!!form && <StyledFormContainer>{form}</StyledFormContainer>}
  </Card>
);
