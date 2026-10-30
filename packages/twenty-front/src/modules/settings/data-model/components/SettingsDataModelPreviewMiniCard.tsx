import { styled } from '@linaria/react';
import { type ReactNode } from 'react';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledMiniCardRoot = styled(Card.Root)`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledMiniCardContent = styled(Card.Content)`
  padding: ${themeCssVariables.spacing[2]};
`;

type SettingsDataModelPreviewMiniCardProps = {
  children: ReactNode;
};

export const SettingsDataModelPreviewMiniCard = ({
  children,
}: SettingsDataModelPreviewMiniCardProps) => (
  <StyledMiniCardRoot fullWidth>
    <StyledMiniCardContent>{children}</StyledMiniCardContent>
  </StyledMiniCardRoot>
);
