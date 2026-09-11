import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { styled } from '@linaria/react';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';
import { Avatar, type AvatarSize } from 'twenty-ui/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type AppChipProps = {
  size?: AvatarSize;
  applicationId?: string | null;
  // Resolved display url (e.g. the registration's logoUrl); takes precedence
  // over the logo computed from the installed application.
  logoUrl?: string | null;
  fallbackApplicationData?: {
    logoUrl?: string | null;
    name?: string | null;
  };
  className?: string;
  chipOnly?: boolean;
  rounded?: boolean;
  pulsing?: boolean;
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
  logoUrl,
  fallbackApplicationData,
  className,
  chipOnly = false,
  rounded = false,
  pulsing = false,
}: AppChipProps) => {
  const { applicationChipData } = useApplicationChipData({
    applicationId,
    fallbackApplicationData,
  });

  return (
    <StyledContainer className={className}>
      <Avatar
        shape={rounded ? 'circle' : 'square'}
        variant={rounded ? 'soft' : 'outline'}
        size={size}
        src={getAbsoluteImageUrl(logoUrl ?? applicationChipData.logo)}
        name={applicationChipData.name}
        colorSeed={applicationChipData.seed}
        color={applicationChipData.colors?.color}
        backgroundColor={applicationChipData.colors?.backgroundColor}
        borderColor={applicationChipData.colors?.borderColor}
        pulsing={pulsing}
      />
      {!chipOnly && (
        <OverflowingTextWithTooltip text={applicationChipData.name} />
      )}
    </StyledContainer>
  );
};
