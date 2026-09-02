import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import { Tag } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID } from '@/object-core/workflows/versions/constants/RestoreCoreWorkflowVersionModalId';
import { usePreviewCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/usePreviewCoreWorkflowVersion';
import { useRestoreCoreWorkflowVersionAsDraft } from '@/object-core/workflows/versions/hooks/useRestoreCoreWorkflowVersionAsDraft';
import { type PreviewedCoreWorkflowVersion } from '@/object-core/workflows/versions/states/previewedCoreWorkflowVersionFamilyState';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledBar = styled.div`
  align-items: center;
  background-color: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin-right: auto;
`;

export const CoreWorkflowVersionPreviewBar = ({
  workflowId,
  previewedCoreWorkflowVersion,
}: {
  workflowId: string;
  previewedCoreWorkflowVersion: PreviewedCoreWorkflowVersion;
}) => {
  const { t } = useLingui();
  const { openModal } = useModal();
  const { cancelCoreWorkflowVersionPreview } =
    usePreviewCoreWorkflowVersion(workflowId);
  const { restoreCoreWorkflowVersionAsDraft, isRestoring, hasExistingDraft } =
    useRestoreCoreWorkflowVersionAsDraft(workflowId);

  const tagProps =
    CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[previewedCoreWorkflowVersion.status];

  const handleRestoreClick = () => {
    if (hasExistingDraft) {
      openModal(RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID);

      return;
    }

    restoreCoreWorkflowVersionAsDraft();
  };

  return (
    <>
      <StyledBar>
        <StyledLabel>{previewedCoreWorkflowVersion.label}</StyledLabel>
        <Tag color={tagProps.color} text={t(tagProps.label)} />
        <Button
          title={t`Cancel`}
          variant="secondary"
          size="small"
          onClick={cancelCoreWorkflowVersionPreview}
        />
        <Button
          title={t`Restore`}
          variant="primary"
          accent="blue"
          size="small"
          disabled={isRestoring}
          onClick={handleRestoreClick}
        />
      </StyledBar>
      <ConfirmationModal
        modalInstanceId={RESTORE_CORE_WORKFLOW_VERSION_MODAL_ID}
        title={t`A draft already exists`}
        subtitle={t`A draft already exists for this workflow. Are you sure you want to erase it?`}
        confirmButtonText={t`Override Draft`}
        loading={isRestoring}
        onConfirmClick={restoreCoreWorkflowVersionAsDraft}
      />
    </>
  );
};
