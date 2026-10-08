import { OnDemandJsonFieldViewer } from '@/object-record/record-field/on-demand/components/OnDemandJsonFieldViewer';
import { useOnDemandFieldDisplay } from '@/object-record/record-field/on-demand/hooks/useOnDemandFieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { t } from '@lingui/core/macro';
import { useCallback, useContext, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';

export const OnDemandJsonFieldDisplay = () => {
  const { onOpenEditMode, isRecordFieldReadOnly, isForbidden } =
    useContext(FieldContext);
  const anchorRef = useRef<HTMLButtonElement>(null);
  const { loadStatus, openOnDemandField, closeOnDemandField } =
    useOnDemandFieldDisplay();

  const setAnchorElement = useCallback(
    (element: HTMLButtonElement | null) => {
      anchorRef.current = element;
      if (!isDefined(element) || isRecordFieldReadOnly || isForbidden) {
        closeOnDemandField();
      }
    },
    [closeOnDemandField, isRecordFieldReadOnly, isForbidden],
  );

  const handleOpen = async () => {
    const loadedField = await openOnDemandField();
    if (
      isDefined(loadedField) &&
      !loadedField.isReadOnly &&
      isDefined(onOpenEditMode)
    ) {
      closeOnDemandField();
      onOpenEditMode();
    }
  };

  return (
    <>
      <Button
        ref={setAnchorElement}
        variant="ghost"
        size="sm"
        aria-haspopup="dialog"
        aria-expanded={loadStatus !== 'closed'}
        aria-busy={loadStatus === 'loading'}
        onClick={(event) => {
          event.stopPropagation();
          void handleOpen();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.stopPropagation();
          }

          if (event.key === 'Escape' && loadStatus !== 'closed') {
            event.stopPropagation();
            event.preventDefault();
            closeOnDemandField();
          }
        }}
      >
        {t`View value`}
      </Button>
      {loadStatus !== 'closed' && (
        <OnDemandJsonFieldViewer
          anchorElement={anchorRef.current ?? undefined}
          loadStatus={loadStatus}
          onClose={closeOnDemandField}
          onRetry={() => void handleOpen()}
        />
      )}
    </>
  );
};
