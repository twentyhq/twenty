import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { Select } from '@/ui/input/components/Select';

const StyledSenderAddress = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type EmailComposerSenderFieldProps = {
  senderOptions: SelectOption<string>[];
  selectedSender?: string;
  onSenderChange: (handle: string) => void;
};

export const EmailComposerSenderField = ({
  senderOptions,
  selectedSender,
  onSenderChange,
}: EmailComposerSenderFieldProps) => {
  if (senderOptions.length > 1) {
    return (
      <ComposerFieldRow label={t`From`}>
        <Select
          dropdownId="email-composer-from-account"
          fullWidth
          variant="transparent"
          value={selectedSender}
          options={senderOptions}
          onChange={onSenderChange}
        />
      </ComposerFieldRow>
    );
  }

  if (!isDefined(selectedSender)) {
    return null;
  }

  return (
    <ComposerFieldRow label={t`From`}>
      <StyledSenderAddress>{selectedSender}</StyledSenderAddress>
    </ComposerFieldRow>
  );
};
