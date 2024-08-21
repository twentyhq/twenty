import { useDataExplorerQueryFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useDataExplorerQueryFieldDisplay';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { GRAY_SCALE, IconCaretRightFilled } from 'twenty-ui';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledIconCaretRightFilled = styled(IconCaretRightFilled)`
  color: ${({ theme }) => theme.color.gray40};
`;

const StyledEmptyValue = styled.div`
  color: ${GRAY_SCALE.gray35};
`;

export const DataExplorerQueryFieldDisplay = () => {
  const theme = useTheme();

  const { fieldValue, fieldDefinition } = useDataExplorerQueryFieldDisplay();

  const containerId = `field-path-display-${fieldDefinition.fieldMetadataId}`;

  return (
    <>
      <StyledContainer id={containerId}>
        DataExplorerQueryFieldDisplay
      </StyledContainer>
    </>
  );
};
