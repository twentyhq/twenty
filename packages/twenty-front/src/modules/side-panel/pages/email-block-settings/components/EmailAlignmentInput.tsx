import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import {
  SegmentedControl,
  type SegmentedControlOption,
} from 'twenty-ui/components/input';
import { IconAlignCenter, IconAlignLeft, IconAlignRight } from 'twenty-ui/icon';

import { StyledEmailFieldLabel } from '@/side-panel/pages/email-block-settings/components/StyledEmailFieldLabel';

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
  const labelId = useId();

  const alignmentOptions: SegmentedControlOption[] = [
    { value: 'left', startIcon: <IconAlignLeft />, 'aria-label': t`Left` },
    {
      value: 'center',
      startIcon: <IconAlignCenter />,
      'aria-label': t`Center`,
    },
    { value: 'right', startIcon: <IconAlignRight />, 'aria-label': t`Right` },
  ];

  return (
    <div>
      <StyledEmailFieldLabel id={labelId}>{label}</StyledEmailFieldLabel>
      <SegmentedControl
        aria-labelledby={labelId}
        options={alignmentOptions}
        value={value}
        onValueChange={onChange}
      />
    </div>
  );
};
