import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconFrame, IconSquare } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type CssBoxSides,
  parseCssBoxValue,
} from '@/advanced-text-editor/utils/parseCssBoxValue';
import { serializeCssBoxValue } from '@/advanced-text-editor/utils/serializeCssBoxValue';
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

type CampaignBoxSidesInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

// A CSS box shorthand (padding, margin, corner radius) edited either as one
// value for all sides or side by side.
export const CampaignBoxSidesInput = ({
  label,
  value,
  onChange,
  placeholder,
}: CampaignBoxSidesInputProps) => {
  const sides = parseCssBoxValue(value);
  const [isPerSide, setIsPerSide] = useState(!areAllSidesEqual(sides));

  const commitAllSides = (input: string) => {
    if (input.trim() === '') {
      onChange('');
      return;
    }

    onChange(toCssToken(input));
  };

  const commitSide = (side: (typeof SIDE_KEYS)[number], input: string) => {
    onChange(serializeCssBoxValue({ ...sides, [side]: toCssToken(input) }));
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
