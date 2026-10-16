import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconFrame, IconSquare } from 'twenty-ui/icon';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Field } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { TextInput } from '@/ui/input/components/TextInput';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledSidesGrid = styled.div`
  display: grid;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  grid-template-columns: repeat(4, 1fr);
`;

const SIDE_KEYS = ['top', 'right', 'bottom', 'left'] as const;

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

type EmailBoxSidesInputProps = {
  label: string;
  sides: CssBoxSides;
  onChange: (sides: CssBoxSides) => void;
  placeholder?: string;
};

export const EmailBoxSidesInput = ({
  label,
  sides,
  onChange,
  placeholder,
}: EmailBoxSidesInputProps) => {
  const { t } = useLingui();
  const [isPerSide, setIsPerSide] = useState(!areAllSidesEqual(sides));
  const sideLabels = {
    top: t`Top`,
    right: t`Right`,
    bottom: t`Bottom`,
    left: t`Left`,
  };

  const commitAllSides = (input: string) => {
    const token = input.trim() === '' ? '' : toCssToken(input);

    onChange({ top: token, right: token, bottom: token, left: token });
  };

  const commitSide = (side: (typeof SIDE_KEYS)[number], input: string) => {
    onChange({
      ...sides,
      [side]: input.trim() === '' ? '' : toCssToken(input),
    });
  };

  const handleSidesModeChange = (sidesMode: string) => {
    if (sidesMode === 'each') {
      setIsPerSide(true);
      return;
    }

    setIsPerSide(false);
    commitAllSides(toDisplayAmount(sides.top));
  };

  return (
    <FormFieldInputContainer>
      <Field.Label>{label}</Field.Label>
      <StyledRow>
        {isPerSide ? (
          <StyledSidesGrid>
            {SIDE_KEYS.map((side) => (
              <TextInput
                key={side}
                value={toDisplayAmount(sides[side])}
                onChange={(input) => commitSide(side, input)}
                placeholder={sideLabels[side].charAt(0)}
                aria-label={sideLabels[side]}
                fullWidth
              />
            ))}
          </StyledSidesGrid>
        ) : (
          <TextInput
            value={toDisplayAmount(sides.top)}
            onChange={commitAllSides}
            placeholder={placeholder ?? '0'}
            rightAdornment="px"
            fullWidth
          />
        )}
        <SegmentedControl
          aria-label={label}
          itemWidth="content"
          value={isPerSide ? 'each' : 'all'}
          onValueChange={handleSidesModeChange}
          options={[
            {
              value: 'all',
              startIcon: <IconSquare />,
              'aria-label': t`Same value on every side`,
            },
            {
              value: 'each',
              startIcon: <IconFrame />,
              'aria-label': t`Edit each side`,
            },
          ]}
        />
      </StyledRow>
    </FormFieldInputContainer>
  );
};
