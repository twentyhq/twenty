import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldJsonValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { useRecordFieldValue } from '@/object-record/record-store/hooks/useRecordFieldValue';
import { t } from '@lingui/core/macro';
import { isNull } from '@sniptt/guards';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/components/data-display';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const OnDemandJsonFieldValue = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);
  const { copyToClipboard } = useCopyToClipboard();
  const fieldValue = useRecordFieldValue<FieldJsonValue>(
    recordId,
    fieldDefinition.metadata.fieldName,
    fieldDefinition,
  );

  if (isNull(fieldValue)) {
    return <span>{t`Empty`}</span>;
  }

  if (!isDefined(fieldValue)) {
    return <span role="alert">{t`This value is no longer available.`}</span>;
  }

  return (
    <JsonTree
      value={fieldValue}
      emptyArrayLabel={t`Empty Array`}
      emptyObjectLabel={t`Empty Object`}
      emptyStringLabel={t`[empty string]`}
      arrowButtonCollapsedLabel={t`Expand`}
      arrowButtonExpandedLabel={t`Collapse`}
      onNodeValueClick={copyToClipboard}
    />
  );
};
