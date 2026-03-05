import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsDataModelPreviewFormCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
  disabled?: boolean;
};

const StyledPreviewContainer = styled.div`
  > div {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledFormContainer = styled.div`
  > div {
    padding: 0;
  }
`;

export const SettingsDataModelPreviewFormCard = ({
  className,
  preview,
  form,
}: SettingsDataModelPreviewFormCardProps) => (
  <Card className={className} fullWidth rounded>
    <StyledPreviewContainer>
      <CardContent divider={!!form}>
        <StyledFormCardTitle>
          <Trans>Preview</Trans>
        </StyledFormCardTitle>
        {preview}
      </CardContent>
    </StyledPreviewContainer>
    {!!form && (
      <StyledFormContainer>
        <CardContent>{form}</CardContent>
      </StyledFormContainer>
    )}
  </Card>
);
