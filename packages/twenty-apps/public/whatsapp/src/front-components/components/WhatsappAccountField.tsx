import { t } from 'twenty-sdk/front-component';
import { getPublicAssetUrl } from 'twenty-sdk/utils';
import { Avatar } from 'twenty-ui/primitives/data-display';
import { Field, Input, InputGroup } from 'twenty-ui/primitives/input';

import { WhatsappHistoryImportStatus } from 'src/front-components/components/WhatsappHistoryImportStatus';
import { type WhatsappHistoryImportState } from 'src/types/whatsapp-history-import-state.type';

type WhatsappAccountFieldProps = {
  name: string;
  handle: string;
  historyImport: WhatsappHistoryImportState | null;
  importProgress: number | undefined;
};

export const WhatsappAccountField = ({
  name,
  handle,
  historyImport,
  importProgress,
}: WhatsappAccountFieldProps) => (
  <Field.Root>
    <Field.Label>{t('Account')}</Field.Label>
    <InputGroup
      startElement={
        <Avatar
          src={getPublicAssetUrl('whatsapp-logomark.svg')}
          name="WhatsApp"
          size="sm"
          shape="rounded-square"
        />
      }
      endElement={
        <WhatsappHistoryImportStatus
          historyImport={historyImport}
          progress={importProgress}
        />
      }
    >
      <Input readOnly value={`${name} · ${handle}`} />
    </InputGroup>
  </Field.Root>
);
