import { type ApplicationDisplayData } from '@/applications/types/applicationDisplayData.type';
import { AppChip } from '@/applications/components/AppChip';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { styled } from '@linaria/react';

type ApplicationDisplayProps = {
  application?: ApplicationDisplayData;
};

const StyledAppChip = styled(AppChip)`
  color: ${themeCssVariables.font.color.primary};
  gap: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
`;

export const ApplicationDisplay = ({
  application,
}: ApplicationDisplayProps) => {
  return <StyledAppChip size="md" applicationId={application?.id ?? ''} />;
};
