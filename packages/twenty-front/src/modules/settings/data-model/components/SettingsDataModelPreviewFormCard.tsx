import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { Trans } from '@lingui/react/macro';
import { Card } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsDataModelPreviewFormCardProps = {
  className?: string;
  preview: ReactNode;
  form?: ReactNode;
  disabled?: boolean;
};

const StyledPreviewContainerWrapper = styled.div`
  > div {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledFormContainerWrapper = styled.div`
  > div {
    padding: 0;
  }
`;

export const SettingsDataModelPreviewFormCard = ({
  className,
  preview,
  form,
}: SettingsDataModelPreviewFormCardProps) => (
  <Card.Root className={className} fullWidth rounded>
    <StyledPreviewContainerWrapper>
      <Card.Content divider={isDefined(form)}>
        <StyledFormCardTitle>
          <Trans>Preview</Trans>
        </StyledFormCardTitle>
        {preview}
      </Card.Content>
    </StyledPreviewContainerWrapper>
    {isDefined(form) && (
      <StyledFormContainerWrapper>
        <Card.Content>{form}</Card.Content>
      </StyledFormContainerWrapper>
    )}
  </Card.Root>
);
