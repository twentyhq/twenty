import { OnDemandJsonFieldValue } from '@/object-record/record-field/on-demand/components/OnDemandJsonFieldValue';
import { type OnDemandFieldLoadResult } from '@/object-record/record-field/on-demand/types/OnDemandFieldLoadResult';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { ExpandedFieldDisplay } from '@/ui/layout/expandable-list/components/ExpandedFieldDisplay';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledViewer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 0;
`;

type OnDemandJsonFieldViewerProps = {
  anchorElement?: HTMLElement;
  loadStatus: 'loading' | OnDemandFieldLoadResult;
  onClose: () => void;
  onRetry: () => void;
};

export const OnDemandJsonFieldViewer = ({
  anchorElement,
  loadStatus,
  onClose,
  onRetry,
}: OnDemandJsonFieldViewerProps) => {
  const { fieldDefinition, isForbidden } = useContext(FieldContext);
  const isReadForbidden = isForbidden || loadStatus === 'forbidden';
  const isError = loadStatus === 'error' || loadStatus === 'stale';

  const content = () => {
    if (isReadForbidden) {
      return (
        <span role="alert">{t`You do not have access to this value.`}</span>
      );
    }

    if (loadStatus === 'loading') {
      return (
        <div role="status" aria-label={t`Loading value…`}>
          <SkeletonLine width={120} height={SKELETON_HEIGHT_SIZES.s} />
        </div>
      );
    }

    if (loadStatus === 'missing') {
      return <span role="alert">{t`Record not found.`}</span>;
    }

    if (isError) {
      return (
        <>
          <span role="alert">{t`Could not load this value.`}</span>
          <Button variant="ghost" size="sm" onClick={onRetry}>
            {t`Retry`}
          </Button>
        </>
      );
    }

    return <OnDemandJsonFieldValue />;
  };

  return (
    <ExpandedFieldDisplay
      anchorElement={anchorElement}
      onClickOutside={onClose}
    >
      <StyledViewer
        role="dialog"
        aria-label={fieldDefinition.label}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          event.stopPropagation();

          if (event.key === 'Escape') {
            event.preventDefault();
            onClose();
          }
        }}
      >
        {content()}
      </StyledViewer>
    </ExpandedFieldDisplay>
  );
};
