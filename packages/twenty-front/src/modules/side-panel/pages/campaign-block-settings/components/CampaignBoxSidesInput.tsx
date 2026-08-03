import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconFrame, IconSquare } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { StyledCampaignFieldLabel } from '@/side-panel/pages/campaign-block-settings/components/StyledCampaignFieldLabel';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};

  & > :first-child {
    flex: 1;
  }
`;

const StyledSidesGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(4, 1fr);
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledUnitChip = styled.div`
  align-items: center;
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.sm};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const SIDE_KEYS = ['top', 'right', 'bottom', 'left'] as const;

const SIDE_PLACEHOLDERS: Record<(typeof SIDE_KEYS)[number], string> = {
  top: 'T',
  right: 'R',
  bottom: 'B',
  left: 'L',
};

const toDisplayAmount = (token: string): string =>
  token.endsWith('px') && !Number.isNaN(Number(token.slice(0, -2)))
    ? token.slice(0, -2)
    : token;

const toCssToken = (input: string): string => {
  const trimmed = input.trim();

  if (trimmed === '') {
    return '0px';
  }

  return Number.isNaN(Number(trimmed)) ? trimmed : `${trimmed}px`;
};

const areAllSidesEqual = ({ top, right, bottom, left }: CssBoxSides) =>
  top === right && right === bottom && bottom === left;

export type CssBoxSides = {
  top: string;
  right: string;
  bottom: string;
  left: string;
};

type CampaignBoxSidesInputProps = {
  label: string;
  sides: CssBoxSides;
  onChange: (sides: CssBoxSides) => void;
  placeholder?: string;
};

// A box property (padding, margin, corner radius) edited either as one value
// for all sides or side by side. Works on the four sides directly; the
// caller owns how they map to style properties.
export const CampaignBoxSidesInput = ({
  label,
  sides,
  onChange,
  placeholder,
}: CampaignBoxSidesInputProps) => {
  const [isPerSide, setIsPerSide] = useState(!areAllSidesEqual(sides));

  const commitAllSides = (input: string) => {
    const token = input.trim() === '' ? '' : toCssToken(input);

    onChange({ top: token, right: token, bottom: token, left: token });
  };

  const commitSide = (side: (typeof SIDE_KEYS)[number], input: string) => {
    onChange({ ...sides, [side]: toCssToken(input) });
  };

  return (
    <div>
      <StyledCampaignFieldLabel>{label}</StyledCampaignFieldLabel>
      <StyledRow>
        {isPerSide ? (
          <StyledSidesGrid>
            {SIDE_KEYS.map((side) => (
              <TextInput
                key={side}
                value={toDisplayAmount(sides[side])}
                onChange={(input) => commitSide(side, input)}
                placeholder={SIDE_PLACEHOLDERS[side]}
                fullWidth
              />
            ))}
          </StyledSidesGrid>
        ) : (
          <TextInput
            value={toDisplayAmount(sides.top)}
            onChange={commitAllSides}
            placeholder={placeholder ?? '0'}
            fullWidth
          />
        )}
        <StyledUnitChip>px</StyledUnitChip>
        <LightIconButton
          Icon={IconSquare}
          size="small"
          accent={isPerSide ? 'tertiary' : 'secondary'}
          onClick={() => {
            setIsPerSide(false);
            commitAllSides(toDisplayAmount(sides.top));
          }}
        />
        <LightIconButton
          Icon={IconFrame}
          size="small"
          accent={isPerSide ? 'secondary' : 'tertiary'}
          onClick={() => setIsPerSide(true)}
        />
      </StyledRow>
    </div>
  );
};
