import { isNonEmptyString } from '@sniptt/guards';

import { useFullNameFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useFullNameFieldDisplay';
import { OverflowingTextWithTooltip } from 'twenty-ui';

export const FullNameFieldDisplay = () => {
  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ');

  return <OverflowingTextWithTooltip text={content} />;
};
