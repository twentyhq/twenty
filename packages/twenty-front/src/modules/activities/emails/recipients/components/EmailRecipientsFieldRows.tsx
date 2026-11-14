import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { flushSync } from 'react-dom';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';

import { ComposerFieldRow } from '@/activities/components/ComposerFieldRow';
import { EmailRecipientsFieldInput } from '@/activities/emails/recipients/components/EmailRecipientsFieldInput';
import { useEmailRecipientsContext } from '@/activities/emails/recipients/contexts/EmailRecipientsContext';
import { type EmailComposerContextRecord } from '@/activities/emails/recipients/types/EmailComposerContextRecord';

type EmailRecipientsFieldRowsProps = {
  isCcBccExpanded: boolean;
  onExpandCcBcc: () => void;
  onSubmit?: () => void;
  contextRecord?: EmailComposerContextRecord | null;
};

export const EmailRecipientsFieldRows = ({
  isCcBccExpanded,
  onExpandCcBcc,
  onSubmit,
  contextRecord,
}: EmailRecipientsFieldRowsProps) => {
  const { t } = useLingui();
  const { draggedRecipients } = useEmailRecipientsContext();
  const ccInputRef = useRef<HTMLInputElement>(null);

  const areCcBccFieldsVisible = isCcBccExpanded || isDefined(draggedRecipients);

  const handleShowCcBcc = () => {
    flushSync(onExpandCcBcc);
    ccInputRef.current?.focus();
  };

  return (
    <>
      <ComposerFieldRow
        label={t`To`}
        trailing={
          !areCcBccFieldsVisible && (
            <LightButton emphasis="subtle" size="sm" onClick={handleShowCcBcc}>
              {t`Cc/Bcc`}
            </LightButton>
          )
        }
      >
        <EmailRecipientsFieldInput
          fieldId="to"
          label={t`To`}
          onSubmit={onSubmit}
          contextRecord={contextRecord}
        />
      </ComposerFieldRow>
      {areCcBccFieldsVisible && (
        <>
          <ComposerFieldRow label={t`Cc`}>
            <EmailRecipientsFieldInput
              fieldId="cc"
              inputRef={ccInputRef}
              label={t`Cc`}
              onSubmit={onSubmit}
              contextRecord={contextRecord}
            />
          </ComposerFieldRow>
          <ComposerFieldRow label={t`Bcc`}>
            <EmailRecipientsFieldInput
              fieldId="bcc"
              label={t`Bcc`}
              onSubmit={onSubmit}
              contextRecord={contextRecord}
            />
          </ComposerFieldRow>
        </>
      )}
    </>
  );
};
