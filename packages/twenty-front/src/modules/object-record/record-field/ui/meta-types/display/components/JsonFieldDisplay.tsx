import { useJsonFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useJsonFieldDisplay';
import { JsonDisplay } from '@/ui/field/display/components/JsonDisplay';
import { ExpandedFieldDisplay } from '@/ui/layout/expandable-list/components/ExpandedFieldDisplay';
import { t } from '@lingui/core/macro';
import { useRef, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { isTwoFirstDepths, JsonTree } from 'twenty-ui/json-visualizer';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

export const JsonFieldDisplay = () => {
  const { copyToClipboard } = useCopyToClipboard();

  const { fieldValue, maxWidth, isRecordFieldReadOnly } = useJsonFieldDisplay();

  const [isJsonTreeViewOpen, setIsJsonTreeViewOpen] = useState(false);
  const anchorRef = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    if (isRecordFieldReadOnly) {
      setIsJsonTreeViewOpen(true);
    }
  };

  const handleClickOutside = () => {
    setIsJsonTreeViewOpen(false);
  };

  if (!isDefined(fieldValue)) {
    return <></>;
  }

  const value = JSON.stringify(fieldValue);

  return (
    <>
      <div ref={anchorRef} onClick={handleClick}>
        <JsonDisplay text={value} maxWidth={maxWidth} />
      </div>
      {isJsonTreeViewOpen && (
        <ExpandedFieldDisplay
          anchorElement={anchorRef.current ?? undefined}
          onClickOutside={handleClickOutside}
        >
          <JsonTree
            value={fieldValue}
            shouldExpandNodeInitially={isTwoFirstDepths}
            emptyArrayLabel={t`Empty Array`}
            emptyObjectLabel={t`Empty Object`}
            emptyStringLabel={t`[empty string]`}
            arrowButtonCollapsedLabel={t`Expand`}
            arrowButtonExpandedLabel={t`Collapse`}
            onNodeValueClick={copyToClipboard}
          />
        </ExpandedFieldDisplay>
      )}
    </>
  );
};
