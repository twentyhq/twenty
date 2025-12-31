import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { UpdateMultipleRecordsFooter } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsFooter';
import { UpdateMultipleRecordsForm } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsForm';
import { useUpdateMultipleRecordsActions } from '@/object-record/record-update-multiple/hooks/useUpdateMultipleRecordsActions';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

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
  background: ${({ theme }) => theme.background.primary};
  padding-bottom: ${({ theme }) => theme.spacing(16)};
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
  const { closeCommandMenu } = useCommandMenu();

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
        closeCommandMenu();
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
    closeCommandMenu();
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
    <RightDrawerProvider value={{ isInRightDrawer: true }}>
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
    </RightDrawerProvider>
  );
};
