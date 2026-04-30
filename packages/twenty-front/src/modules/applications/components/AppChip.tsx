import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { styled } from '@linaria/react';
import {
  Avatar,
  type AvatarSize,
  OverflowingTextWithTooltip,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppChipProps = {
  size?: AvatarSize;
  applicationId?: string | null;
  fallbackApplicationData?: {
    logo?: string | null;
    name?: string | null;
  };
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

export const AppChip = ({
  applicationId,
  size = 'sm',
  fallbackApplicationData,
  className,
}: AppChipProps) => {
  const { applicationChipData } = useApplicationChipData({
    applicationId,
    fallbackApplicationData,
  });

  return (
    <StyledContainer className={className}>
      <Avatar
        type="app"
        size={size}
        avatarUrl={applicationChipData.logo}
        placeholder={applicationChipData.name}
        placeholderColorSeed={applicationChipData.seed}
        color={applicationChipData.colors?.color}
        backgroundColor={applicationChipData.colors?.backgroundColor}
        borderColor={applicationChipData.colors?.borderColor}
      />
      <OverflowingTextWithTooltip text={applicationChipData.name} />
    </StyledContainer>
  );
};
