import { styled } from '@linaria/react';
import { type ReactNode } from 'react';

import { StyledFormCardTitle } from '@/settings/data-model/fields/components/StyledFormCardTitle';
import { SETTINGS_DATA_MODEL_PREVIEW_SECTION_CLASS_NAME } from '@/settings/data-model/styles/SettingsDataModelPreviewSectionClassName';
import { Trans } from '@lingui/react/macro';
import { Card } from 'twenty-ui/primitives/surfaces';
import { isDefined } from 'twenty-shared/utils';

type SettingsDataModelPreviewFormCardProps = {
  preview: ReactNode;
  form?: ReactNode;
  disabled?: boolean;
  isPreviewTitleVisible?: boolean;
};

const StyledFormCardContent = styled(Card.Content)`
  padding: 0;
`;

export const SettingsDataModelPreviewFormCard = ({
  preview,
  form,
  isPreviewTitleVisible = true,
}: SettingsDataModelPreviewFormCardProps) => (
  <Card.Root fullWidth>
    <Card.Content
      className={SETTINGS_DATA_MODEL_PREVIEW_SECTION_CLASS_NAME}
      divider={isDefined(form)}
    >
      {isPreviewTitleVisible && (
        <StyledFormCardTitle>
          <Trans>Preview</Trans>
        </StyledFormCardTitle>
      )}
      {preview}
    </Card.Content>
    {isDefined(form) && <StyledFormCardContent>{form}</StyledFormCardContent>}
  </Card.Root>
);
