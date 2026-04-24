import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { styled } from '@linaria/react';
import { Avatar } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppChipProps = {
  applicationId: string;
  className?: string;
};

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: inline-flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledLabel = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const AppChip = ({ applicationId, className }: AppChipProps) => {
  const { applicationChipData } = useApplicationChipData({ applicationId });

  return (
    <StyledContainer className={className}>
      <Avatar
        type="app"
        size="sm"
        placeholder={applicationChipData.name}
        placeholderColorSeed={applicationChipData.seed}
        color={applicationChipData.colors?.color}
        backgroundColor={applicationChipData.colors?.backgroundColor}
        borderColor={applicationChipData.colors?.borderColor}
      />
      <StyledLabel title={applicationChipData.name}>
        {applicationChipData.name}
      </StyledLabel>
    </StyledContainer>
  );
};
