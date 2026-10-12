import { useLingui } from '@lingui/react/macro';
import { IconAlignCenter, IconAlignLeft, IconAlignRight } from 'twenty-ui/icon';
import { SegmentedControl } from 'twenty-ui/components/input';
import { Field } from 'twenty-ui/primitives/input';

import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';

type EmailAlignmentInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export const EmailAlignmentInput = ({
  label,
  value,
  onChange,
}: EmailAlignmentInputProps) => {
  const { t } = useLingui();

  return (
    <FormFieldInputContainer>
      <Field.Label>{label}</Field.Label>
      <SegmentedControl
        aria-label={label}
        value={value}
        onValueChange={onChange}
        options={[
          {
            value: 'left',
            startIcon: <IconAlignLeft />,
            'aria-label': t`Align left`,
          },
          {
            value: 'center',
            startIcon: <IconAlignCenter />,
            'aria-label': t`Align center`,
          },
          {
            value: 'right',
            startIcon: <IconAlignRight />,
            'aria-label': t`Align right`,
          },
        ]}
      />
    </FormFieldInputContainer>
  );
};
