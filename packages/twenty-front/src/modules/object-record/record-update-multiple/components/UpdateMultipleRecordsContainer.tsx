import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { UpdateMultipleRecordsFooter } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsFooter';
import { UpdateMultipleRecordsForm } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { SidePanelProvider } from '@/ui/layout/side-panel/contexts/SidePanelContext';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledShowPageRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: start;
  width: 100%;
  height: 100%;
  overflow: auto;
`;

const StyledContentContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  background: ${themeCssVariables.background.primary};
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

  const { t } = useLingui();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const [fieldUpdates, setFieldUpdates] = useState<UpdateMultipleRecordsState>(
    {},
  );

  const handleUpdate = async () => {
    try {
      const count = await updateRecords(fieldUpdates);
      if (count !== undefined) {
        enqueueSuccessSnackBar({
          message: t`Successfully updated ${count} records`,
        });
        closeSidePanelMenu();
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
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
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            isUpdateDisabled={!hasChanges}
          />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
    </SidePanelProvider>
  );
};
