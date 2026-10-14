import { css, cx } from '@linaria/core';
import { type ReactNode } from 'react';
import { Dialog } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const stepBodyClassName = css`
  display: flex;
  flex: 1 1 0%;
  flex-direction: column;
`;

const stepBodyPaddingClassNames = {
  none: css`
    padding: 0;
  `,
  medium: css`
    padding: ${themeCssVariables.spacing[6]};
  `,
  large: css`
    padding: ${themeCssVariables.spacing[10]};
  `,
};

const horizontallyCenteredStepBodyClassName = css`
  align-items: center;
`;

const verticallyCenteredStepBodyClassName = css`
  justify-content: center;
`;

const largeGapStepBodyClassName = css`
  gap: ${themeCssVariables.spacing[8]};
`;

type SpreadsheetImportStepBodyProps = {
  children: ReactNode;
  padding?: keyof typeof stepBodyPaddingClassNames;
  isCenteredHorizontally?: boolean;
  isCenteredVertically?: boolean;
  hasLargeGap?: boolean;
};

export const SpreadsheetImportStepBody = ({
  children,
  padding = 'none',
  isCenteredHorizontally = false,
  isCenteredVertically = false,
  hasLargeGap = false,
}: SpreadsheetImportStepBodyProps) => (
  <Dialog.Body
    className={cx(
      stepBodyClassName,
      stepBodyPaddingClassNames[padding],
      isCenteredHorizontally && horizontallyCenteredStepBodyClassName,
      isCenteredVertically && verticallyCenteredStepBodyClassName,
      hasLargeGap && largeGapStepBodyClassName,
    )}
  >
    {children}
  </Dialog.Body>
);
