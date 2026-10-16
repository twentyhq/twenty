import { styled } from '@linaria/react';
import { type MouseEvent, type MouseEventHandler, type ReactNode } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { themeCssVariables } from 'twenty-ui/theme';

import { COMPOSER_LABEL_MIN_WIDTH } from '@/activities/constants/ComposerLabelMinWidth';

const ROW_MIN_HEIGHT = '40px';

const NESTED_CONTROL_SELECTOR = doNotTranslate(
  'input, textarea, button, a[href], [role="button"]',
);

const StyledContent = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  min-width: 0;
  padding: 0 ${themeCssVariables.spacing[2]};

  & :focus-visible {
    outline: none;
  }
`;

const StyledRow = styled.div<{ $clickable: boolean }>`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-sizing: border-box;
  cursor: ${({ $clickable }) => ($clickable ? 'pointer' : 'default')};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  min-height: ${ROW_MIN_HEIGHT};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[1]}
    ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[3]};
  width: 100%;

  &:hover {
    background-color: ${({ $clickable }) =>
      $clickable
        ? themeCssVariables.background.transparent.lighter
        : 'transparent'};
  }

  &:has(${StyledContent} :focus-visible) {
    background-color: ${themeCssVariables.background.transparent.lighter};
  }

  &:last-of-type {
    border-bottom: none;
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.regular};
  min-width: ${COMPOSER_LABEL_MIN_WIDTH};
`;

const StyledTrailing = styled.div`
  align-items: center;
  display: flex;
`;

type ComposerFieldRowProps = {
  label: string;
  children: ReactNode;
  trailing?: ReactNode;
  onClick?: MouseEventHandler<HTMLDivElement>;
};

// The label is a plain span, so the row is named as a group to give assistive technology the field name.
export const ComposerFieldRow = ({
  label,
  children,
  trailing,
  onClick,
}: ComposerFieldRowProps) => {
  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!(event.target instanceof Element)) {
      return;
    }

    const row = event.currentTarget;
    const nestedControl = event.target.closest(NESTED_CONTROL_SELECTOR);
    const isFromPortaledContent = !row.contains(event.target);
    const isOnNestedControl =
      isDefined(nestedControl) && row.contains(nestedControl);

    if (isFromPortaledContent || isOnNestedControl) {
      return;
    }

    onClick?.(event);
  };

  return (
    <StyledRow
      role="group"
      aria-label={label}
      $clickable={isDefined(onClick)}
      onClick={isDefined(onClick) ? handleClick : undefined}
    >
      <StyledLabel aria-hidden="true">{label}</StyledLabel>
      <StyledContent>{children}</StyledContent>
      {isDefined(trailing) && (
        <StyledTrailing onClick={(event) => event.stopPropagation()}>
          {trailing}
        </StyledTrailing>
      )}
    </StyledRow>
  );
};
