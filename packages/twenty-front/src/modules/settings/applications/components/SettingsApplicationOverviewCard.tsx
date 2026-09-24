import { AppChip } from '@/applications/components/AppChip';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme';

const COVER_WIDTH_PX = 272;
const CARD_MIN_HEIGHT_PX = 150;

const StyledCard = styled(Card)`
  display: flex;
  min-height: ${CARD_MIN_HEIGHT_PX}px;
`;

const StyledIdentity = styled.div`
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-width: 0;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  justify-content: center;
  min-width: 0;
`;

const StyledName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: ${themeCssVariables.text.lineHeight.lg};
  overflow-wrap: anywhere;
`;

const StyledActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledCover = styled.div`
  background: ${themeCssVariables.background.secondary};
  flex: 0 1 ${COVER_WIDTH_PX}px;
  overflow: hidden;
  position: relative;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    display: none;
  }
`;

const StyledCoverImage = styled.img`
  display: block;
  height: 100%;
  inset: 0;
  object-fit: cover;
  object-position: left top;
  position: absolute;
  width: 100%;
`;

type SettingsApplicationOverviewCardProps = {
  applicationId?: string | null;
  logoUrl?: string | null;
  displayName: string;
  description?: string;
  coverImageUrl?: string;
  actions?: ReactNode;
};

export const SettingsApplicationOverviewCard = ({
  applicationId,
  logoUrl,
  displayName,
  description,
  coverImageUrl,
  actions,
}: SettingsApplicationOverviewCardProps) => {
  return (
    <StyledCard
      rounded
      fullWidth
      backgroundColor={themeCssVariables.background.secondary}
    >
      <StyledIdentity>
        <AppChip
          applicationId={applicationId}
          logoUrl={logoUrl}
          fallbackApplicationData={{ name: displayName }}
          size="xl"
          chipOnly
        />
        <StyledText>
          <StyledName>{displayName}</StyledName>
          {isNonEmptyString(description) && (
            <StyledDescription>{description}</StyledDescription>
          )}
        </StyledText>
        {isDefined(actions) && <StyledActions>{actions}</StyledActions>}
      </StyledIdentity>
      {isNonEmptyString(coverImageUrl) && (
        <StyledCover>
          <StyledCoverImage src={coverImageUrl} alt="" aria-hidden />
        </StyledCover>
      )}
    </StyledCard>
  );
};
