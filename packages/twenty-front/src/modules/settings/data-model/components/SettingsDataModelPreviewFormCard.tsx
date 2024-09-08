import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { Card } from '@/ui/layout/card/components/Card';
import { CardContent } from '@/ui/layout/card/components/CardContent';

type SettingsDataModelPreviewFormCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
};

const StyledPreviewContainer = styled(CardContent)`
  background-color: ${({ theme }) => theme.background.transparent.lighter};
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
      <StyledFormCardTitle>Preview</StyledFormCardTitle>
      {preview}
    </StyledPreviewContainer>
    {!!form && <StyledFormContainer>{form}</StyledFormContainer>}
  </Card>
);
