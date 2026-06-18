import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { Trans } from '@lingui/react/macro';
import { Card, CardContent } from 'twenty-ui/layout';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsDataModelPreviewFormCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
  disabled?: boolean;
};

const StyledPreviewContainerWrapper = styled.div`
  > * {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledFormContainerWrapper = styled.div`
  > * {
    padding: 0;
  }
`;

export const SettingsDataModelPreviewFormCard = ({
  className,
  preview,
  form,
}: SettingsDataModelPreviewFormCardProps) => (
  <Card className={className} fullWidth rounded>
    <StyledPreviewContainerWrapper>
      <CardContent divider={isDefined(form)}>
        <StyledFormCardTitle>
          <Trans>Preview</Trans>
        </StyledFormCardTitle>
        {preview}
      </CardContent>
    </StyledPreviewContainerWrapper>
    {isDefined(form) && (
      <StyledFormContainerWrapper>
        <CardContent>{form}</CardContent>
      </StyledFormContainerWrapper>
    )}
  </Card>
);
