import { styled } from '@linaria/react';
import { Trans } from '@lingui/react/macro';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

import { StyledFormCardTitle } from '@/settings/components/StyledFormCardTitle';

type SettingsPreviewCardProps = {
  preview: ReactNode;
  content?: ReactNode;
  isPreviewTitleVisible?: boolean;
  hasPreviewGutter?: boolean;
};

const StyledPreviewContent = styled(Card.Content)`
  background-color: ${themeCssVariables.background.transparent.lighter};
`;

const StyledFlushPreviewContent = styled(StyledPreviewContent)`
  padding: 0;
`;

const StyledContent = styled(Card.Content)`
  padding: 0;
`;

export const SettingsPreviewCard = ({
  preview,
  content,
  isPreviewTitleVisible = true,
  hasPreviewGutter = true,
}: SettingsPreviewCardProps) => {
  const PreviewContent = hasPreviewGutter
    ? StyledPreviewContent
    : StyledFlushPreviewContent;

  return (
    <Card.Root fullWidth>
      <PreviewContent divider={isDefined(content)}>
        {isPreviewTitleVisible && (
          <StyledFormCardTitle>
            <Trans>Preview</Trans>
          </StyledFormCardTitle>
        )}
        {preview}
      </PreviewContent>
      {isDefined(content) && <StyledContent>{content}</StyledContent>}
    </Card.Root>
  );
};
