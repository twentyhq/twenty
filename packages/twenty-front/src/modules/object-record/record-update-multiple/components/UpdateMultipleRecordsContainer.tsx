import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import styled from '@emotion/styled';
import { useState } from 'react';

import { UpdateMultipleRecordsChooseFieldsStep } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsChooseFieldsStep';
import { UpdateMultipleRecordsFooter } from '@/object-record/record-update-multiple/components/UpdateMultipleRecordsFooter';
import { ShowPageContainer } from '@/ui/layout/page/components/ShowPageContainer';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import { useUpdateMultipleRecordsActions } from '../hooks/useUpdateMultipleRecordsActions';
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
}: {
  objectNameSingular: string;
}) => {
  const { updateRecords, isUpdating, progress, cancel } = useUpdateMultipleRecordsActions({
    objectNameSingular,
  });

  const { closeCommandMenu } = useCommandMenu();

  const [fieldUpdates, setFieldUpdates] = useState<UpdateMultipleRecordsState>({});

  const handleUpdate = () => {
    updateRecords(fieldUpdates);
  };

  const handleCancel = () => {
    cancel();
    closeCommandMenu();
  };

  const hasChanges = Object.values(fieldUpdates).some((value) => value !== undefined);

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
            <UpdateMultipleRecordsChooseFieldsStep
              disabled={isUpdating}
              values={fieldUpdates}
              onChange={handleFieldChange}
            />
          </StyledContentContainer>
          <UpdateMultipleRecordsFooter
            isUpdating={isUpdating}
            onUpdate={handleUpdate}
            onCancel={handleCancel}
            isUpdateDisabled={!hasChanges}
            progress={progress}
          />
        </StyledShowPageRightContainer>
      </ShowPageContainer>
    </RightDrawerProvider>
  );
};
