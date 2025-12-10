import { useJsonFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useJsonFieldDisplay';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { JsonTree } from 'twenty-ui/json-visualizer';

export const JsonFieldDisplay = () => {
  const { fieldValue, maxWidth } = useJsonFieldDisplay();

  const [isJsonTreeViewOpen, setIsJsonTreeViewOpen] = useState(false);

  const handleClick = () => {
    setIsJsonTreeViewOpen(true);
  };

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  return (
    <div onClick={handleClick}>
      <JsonDisplay text={value} maxWidth={maxWidth} />
      {isJsonTreeViewOpen && (
        <JsonTree
          value={fieldValue}
          shouldExpandNodeInitially={() => true}
          emptyArrayLabel={t`Empty Array`}
          emptyObjectLabel={t`Empty Object`}
          emptyStringLabel={t`[empty string]`}
          arrowButtonCollapsedLabel={t`Expand`}
          arrowButtonExpandedLabel={t`Collapse`}
        />
      )}
    </div>
  );
};
