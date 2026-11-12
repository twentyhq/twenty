import { styled } from '@linaria/react';
import { type IconComponent, IconLock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const PRIVACY_NOTE_ICON_SIZE = 12;

const StyledNote = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledNoteText = styled.span`
  line-height: 1.4;
  margin-block: calc((${PRIVACY_NOTE_ICON_SIZE}px - 1.4em) / 2);
`;

type OnboardingImportPrivacyNoteProps = {
  text: string;
  Icon?: IconComponent;
};

export const OnboardingImportPrivacyNote = ({
  text,
  Icon = IconLock,
}: OnboardingImportPrivacyNoteProps) => (
  <StyledNote>
    <Icon
      size={PRIVACY_NOTE_ICON_SIZE}
      color={themeCssVariables.font.color.tertiary}
    />
    <StyledNoteText>{text}</StyledNoteText>
  </StyledNote>
);
