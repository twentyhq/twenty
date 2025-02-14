import styled from '@emotion/styled';
import { ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from 'twenty-ui';

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
  <Card className={className} fullWidth rounded>
    <StyledPreviewContainer divider={!!form}>
      <StyledFormCardTitle>
        <Trans>Preview</Trans>
      </StyledFormCardTitle>
      {preview}
    </StyledPreviewContainer>
    {!!form && <StyledFormContainer>{form}</StyledFormContainer>}
  </Card>
);
