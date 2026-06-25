import { css, cx } from '@linaria/core';
import { type ReactNode } from 'react';
import { Field } from 'twenty-ui/input';

const containerClassName = css`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

type FormFieldInputContainerProps = {
  children?: ReactNode;
  className?: string;
  'data-testid'?: string;
};

export const FormFieldInputContainer = ({
  children,
  className,
  'data-testid': dataTestId,
}: FormFieldInputContainerProps) => (
  <Field.Root
    className={cx(containerClassName, className)}
    data-testid={dataTestId}
  >
    {children}
  </Field.Root>
);
