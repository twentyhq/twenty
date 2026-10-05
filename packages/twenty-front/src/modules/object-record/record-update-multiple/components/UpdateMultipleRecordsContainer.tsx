import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { UpdateMultipleRecordsFooter } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsFooter';
import { UpdateMultipleRecordsForm } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useToast } from 'twenty-ui/components';
import { themeCssVariables } from 'twenty-ui/theme';

const UPDATE_MULTIPLE_RECORDS_CONFIRMATION_MODAL_ID =
  'update-multiple-records-confirmation';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: start;
  overflow: auto;
  width: 100%;
`;

const StyledContentContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  flex: 1;
  overflow-y: auto;
  padding-bottom: ${themeCssVariables.spacing[16]};
`;

export type UpdateMultipleRecordsState = Record<string, any>;

export const UpdateMultipleRecordsContainer = ({
  objectNameSingular,
  contextStoreInstanceId,
}: {
  objectNameSingular: string;
  contextStoreInstanceId: string;
}) => {
  const { updateRecords, isUpdating, progress, cancel } =
    useUpdateMultipleRecordsActions({
      objectNameSingular,
      contextStoreInstanceId,
    });

  const contextStoreNumberOfSelectedRecords = useAtomComponentStateValue(
    contextStoreNumberOfSelectedRecordsComponentState,
    contextStoreInstanceId,
  );

  const hasSelectedRecords = contextStoreNumberOfSelectedRecords > 0;

  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog } = useDialog();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const [fieldUpdates, setFieldUpdates] = useState<UpdateMultipleRecordsState>(
    {},
  );

  const handleUpdateClick = () => {
    openDialog(UPDATE_MULTIPLE_RECORDS_CONFIRMATION_MODAL_ID);
  };

  const handleConfirmedUpdate = async () => {
    try {
      await updateRecords(fieldUpdates);
      closeSidePanelMenu();
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Failed to update records. Please try again.`,
      });
    }
  };

  const handleCancel = () => {
    cancel();
    closeSidePanelMenu();
  };

  const hasChanges = Object.values(fieldUpdates).some(
    (value) => value !== undefined,
  );

  const handleFieldChange = (fieldName: string, value: any) => {
    setFieldUpdates((prevState) => ({
      ...prevState,
      [fieldName]: value,
    }));
  };

  return (
    <SidePanelProvider value={{ isInSidePanel: true }}>
      <ShowPageContainer>
        <StyledShowPageRightContainer>
          <StyledContentContainer>
            <UpdateMultipleRecordsForm
              disabled={isUpdating}
              values={fieldUpdates}
              onChange={handleFieldChange}
              objectNameSingular={objectNameSingular}
            />
          </StyledContentContainer>
          <UpdateMultipleRecordsFooter
            isUpdating={isUpdating}
            progress={progress}
            onUpdate={handleUpdateClick}
            onCancel={handleCancel}
            isUpdateDisabled={!hasChanges || !hasSelectedRecords}
          />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
      <ConfirmationDialog
        dialogId={UPDATE_MULTIPLE_RECORDS_CONFIRMATION_MODAL_ID}
        title={t`Update ${contextStoreNumberOfSelectedRecords} records`}
        subtitle={t`This will modify ${contextStoreNumberOfSelectedRecords} records. This action cannot be undone.`}
        onConfirmClick={handleConfirmedUpdate}
        confirmButtonText={t`Update records`}
        confirmButtonColor="accent"
      />
    </SidePanelProvider>
  );
};
