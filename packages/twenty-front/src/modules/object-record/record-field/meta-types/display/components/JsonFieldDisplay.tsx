import { useJsonFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useJsonFieldDisplay';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { isDefined } from '~/utils/isDefined';

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonFieldDisplay();

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  return <JsonDisplay text={value} maxWidth={maxWidth} />;
};
