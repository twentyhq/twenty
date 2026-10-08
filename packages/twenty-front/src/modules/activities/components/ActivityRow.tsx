import { styled } from '@linaria/react';
import { type MouseEvent, type PropsWithChildren } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowContentContainer = styled.div`
  > div {
    align-items: center;
    box-sizing: border-box;
    display: flex;
    gap: ${themeCssVariables.spacing[2]};
    height: ${themeCssVariables.spacing[12]};
    padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
    position: relative;
  }
`;

const StyledRowAction = styled.button`
  background: transparent;
  border: none;
  cursor: pointer;
  inset: 0;
  padding: 0;
  position: absolute;

  &:not(:disabled):hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:disabled {
    cursor: default;
    pointer-events: none;
  }

  &:focus-visible {
    outline: 2px solid ${themeCssVariables.color.blue};
    outline-offset: -2px;
  }
`;

const INDEPENDENT_ROW_ACTION_SELECTOR = [
  'a',
  'button',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="checkbox"]',
  '[role="link"]',
  '[role="switch"]',
  '[contenteditable]:not([contenteditable="false"])',
].join(', ');

type ActivityRowProps = PropsWithChildren<{
  onClick?: () => void;
  disabled?: boolean;
  label: string;
}>;

export const ActivityRow = ({
  children,
  onClick,
  disabled,
  label,
}: ActivityRowProps) => {
  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      disabled === true ||
      event.defaultPrevented ||
      !(target instanceof Element) ||
      isDefined(target.closest(INDEPENDENT_ROW_ACTION_SELECTOR))
    ) {
      return;
    }

    onClick?.();
  };

  return (
    <StyledRowContentContainer>
      <Card.Content onClick={handleContentClick}>
        {isDefined(onClick) && (
          <StyledRowAction
            type="button"
            aria-label={label}
            onClick={onClick}
            disabled={disabled}
          />
        )}
        {children}
      </Card.Content>
    </StyledRowContentContainer>
  );
};
