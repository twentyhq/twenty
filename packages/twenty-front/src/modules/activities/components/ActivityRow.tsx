import { styled } from '@linaria/react';
import { type MouseEvent, type PropsWithChildren } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledRowContent = styled(Card.Content)`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  height: ${themeCssVariables.spacing[12]};
  padding: ${themeCssVariables.spacing[0]} ${themeCssVariables.spacing[4]};
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
  divider?: boolean;
  label: string;
}>;

export const ActivityRow = ({
  children,
  onClick,
  disabled,
  divider = false,
  label,
}: ActivityRowProps) => {
  const handleContentClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;

    if (
      disabled ||
      event.defaultPrevented ||
      !(target instanceof Element) ||
      isDefined(target.closest(INDEPENDENT_ROW_ACTION_SELECTOR))
    ) {
      return;
    }

    onClick?.();
  };

  return (
    <StyledRowContent divider={divider} onClick={handleContentClick}>
      {isDefined(onClick) && (
        <Card.Action aria-label={label} onClick={onClick} disabled={disabled} />
      )}
      {children}
    </StyledRowContent>
  );
};
