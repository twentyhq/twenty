import { useJsonField } from '@/object-record/record-field/meta-types/hooks/useJsonField';
import { isFieldRawJsonValue } from '@/object-record/record-field/types/guards/isFieldRawJsonValue';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { isDefined } from '~/utils/isDefined';

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonField();

  return (
    <JsonDisplay
      text={
        isFieldRawJsonValue(fieldValue) && isDefined(fieldValue)
          ? JSON.stringify(fieldValue)
          : ''
      }
      maxWidth={maxWidth}
    />
  );
};
