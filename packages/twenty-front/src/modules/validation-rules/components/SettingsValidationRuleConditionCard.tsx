import { useState } from 'react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsDataModelPreviewFormCard } from '@/settings/data-model/components/SettingsDataModelPreviewFormCard';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { SettingsValidationRulePreview } from '@/validation-rules/components/SettingsValidationRulePreview';
import { SettingsValidationRulePreviewNavigation } from '@/validation-rules/components/SettingsValidationRulePreviewNavigation';
import { useValidationRulePreviewRecords } from '@/validation-rules/hooks/useValidationRulePreviewRecords';
import { type ValidationRuleEditorField } from '@/validation-rules/types/ValidationRuleEditorField';

type SettingsValidationRuleConditionCardProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  editorFields: ValidationRuleEditorField[];
  expression: string;
  onExpressionChange: (expression: string) => void;
};

export const SettingsValidationRuleConditionCard = ({
  objectMetadataItem,
  fields,
  editorFields,
  expression,
  onExpressionChange,
}: SettingsValidationRuleConditionCardProps) => {
  const [previewRecordIndex, setPreviewRecordIndex] = useState(0);

  const { records, loading, compilationResult } =
    useValidationRulePreviewRecords({
      objectMetadataItem,
      fields,
      expression,
    });

  const recordIndex = Math.min(previewRecordIndex, records.length - 1);
  const record = records[recordIndex];

  return (
    <SettingsDataModelPreviewFormCard
      previewTitleEndElement={
        !loading &&
        isDefined(record) && (
          <SettingsValidationRulePreviewNavigation
            recordIndex={recordIndex}
            recordCount={records.length}
            onRecordIndexChange={setPreviewRecordIndex}
          />
        )
      }
      preview={
        !loading && (
          <SettingsValidationRulePreview
            objectMetadataItem={objectMetadataItem}
            fields={fields}
            editorFields={editorFields}
            expression={expression}
            compilationResult={compilationResult}
            record={record}
          />
        )
      }
      form={
        <SettingsValidationRuleExpressionEditor
          value={expression}
          fields={fields}
          editorFields={editorFields}
          onChange={onExpressionChange}
        />
      }
    />
  );
};
