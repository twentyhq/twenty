import { FieldDisplay } from '@/object-record/record-field/ui/components/FieldDisplay';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { type FieldDefinition } from '@/object-record/record-field/ui/types/FieldDefinition';
import { RightDrawerProvider } from '@/ui/layout/right-drawer/contexts/RightDrawerContext';
import styled from '@emotion/styled';

const StyledContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(1)};
  width: 100%;
`;

type FieldWidgetDisplayProps = {
  fieldDefinition: FieldDefinition<any>;
  recordId: string;
  isInRightDrawer: boolean;
};

export const FieldWidgetDisplay = ({
  fieldDefinition,
  recordId,
  isInRightDrawer,
}: FieldWidgetDisplayProps) => {
  return (
    <RightDrawerProvider value={{ isInRightDrawer }}>
      <StyledContainer>
        <FieldContext.Provider
          value={{
            recordId,
            maxWidth: 200,
            isLabelIdentifier: false,
            fieldDefinition,
            isDisplayModeFixHeight: true,
            isRecordFieldReadOnly: true,
          }}
        >
          <FieldDisplay />
        </FieldContext.Provider>
      </StyledContainer>
    </RightDrawerProvider>
  );
};
