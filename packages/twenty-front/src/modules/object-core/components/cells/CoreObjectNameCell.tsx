import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { Avatar, type AvatarShape } from 'twenty-ui/primitives/data-display';
import { OverflowingTextWithTooltip } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  min-width: 0;
  overflow: hidden;
`;

const StyledAvatarContainer = styled.span`
  align-items: center;
  display: flex;
  flex-shrink: 0;
`;

type CoreObjectNameCellProps = {
  name: string | null | undefined;
  avatarColorSeed: string;
  avatarShape: AvatarShape;
};

export const CoreObjectNameCell = ({
  name,
  avatarColorSeed,
  avatarShape,
}: CoreObjectNameCellProps) => {
  const { t } = useLingui();

  return (
    <StyledContainer>
      <StyledAvatarContainer>
        <Avatar
          name={name ?? undefined}
          colorSeed={avatarColorSeed}
          size="sm"
          shape={avatarShape}
        />
      </StyledAvatarContainer>
      <OverflowingTextWithTooltip
        text={isNonEmptyString(name) ? name : t`Untitled`}
      />
    </StyledContainer>
  );
};
